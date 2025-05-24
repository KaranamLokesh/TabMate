document.getElementById('refresh').addEventListener('click', async () => {
    const tabs = await chrome.runtime.sendMessage({ action: 'getTabs' });
    renderTabs(tabs);
  });
  
  function renderTabs(tabs) {
    const container = document.getElementById('tabsList');
    container.innerHTML = tabs.map(tab => `
      <div class="tab-item">
        <img src="${tab.favIconUrl}" width="16" height="16">
        <span>${tab.title}</span>
      </div>
    `).join('');
  }
  
  // Initial load
  chrome.runtime.sendMessage({ action: 'getTabs' }, renderTabs);
  