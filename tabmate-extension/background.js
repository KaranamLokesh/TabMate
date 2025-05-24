// Message handler for web app commands
chrome.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
      // Allow localhost and 127.0.0.1
      const isLocalhost = sender.url.startsWith("http://localhost") || 
                         sender.url.startsWith("http://127.0.0.1");
      
      if (isLocalhost) {
        handleTabCommand(request)
          .then(sendResponse)
          .catch(error => {
            console.error('Command failed:', error);
            sendResponse({ error: error.message });
          });
        return true;
      }
    }
  );
  
  
  // Tab command processor
  async function handleTabCommand(command) {
    switch (command.action) {
      case 'closeTabs':
        return closeTabsByPattern(command.pattern);
      case 'groupTabs':
        return groupTabs(command.tabIds, command.groupName);
      case 'getTabs':
        return getAllTabs();
      default:
        throw new Error('Unsupported command');
    }
  }
  
  // Close tabs by URL pattern
  async function closeTabsByPattern(urlPattern) {
    const tabs = await chrome.tabs.query({ url: urlPattern });
    const tabIds = tabs.map(t => t.id);
    await chrome.tabs.remove(tabIds);
    return { closedCount: tabIds.length };
  }
  
  // Group tabs
  async function groupTabs(tabIds, groupName) {
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title: groupName });
    return { groupId, tabCount: tabIds.length };
  }
  
  // Get all tabs
  async function getAllTabs() {
    const tabs = await chrome.tabs.query({});
    return tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl
    }));
  }
  