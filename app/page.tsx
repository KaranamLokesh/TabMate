"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search, Brain, Zap, Trash2, FolderOpen, Globe, Monitor, Coffee, BookOpen, ShoppingCart, Music, Settings, Plus, X, ExternalLink, Mic, MicOff, CommandIcon, Clock, Lightbulb, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Tab {
  id: string
  title: string
  url: string
  favicon: string
  category: string
  isActive?: boolean
  isDuplicate?: boolean
  isDistraction?: boolean
}

interface TabGroup {
  category: string
  icon: any
  color: string
  tabs: Tab[]
}

interface AICommand {
  text: string
  timestamp: Date
  result?: string
}

const categoryIcons = {
  Work: Monitor,
  Research: BookOpen,
  Entertainment: Music,
  Shopping: ShoppingCart,
  Social: Coffee,
  News: Globe,
  Other: FolderOpen,
}
const mockTabs: Tab[] = [
  {
    id: "1",
    title: "GitHub - AI Tab Manager",
    url: "https://github.com/user/ai-tab-manager",
    favicon: "🐙",
    category: "Work",
    isActive: true,
  },
  {
    id: "2",
    title: "OpenAI API Documentation",
    url: "https://platform.openai.com/docs",
    favicon: "🤖",
    category: "Work",
  },
  {
    id: "3",
    title: "React Documentation",
    url: "https://react.dev",
    favicon: "⚛️",
    category: "Work",
  },
  {
    id: "4",
    title: "YouTube - AI Explained",
    url: "https://youtube.com/watch?v=ai-video",
    favicon: "📺",
    category: "Entertainment",
    isDistraction: true,
  },
  {
    id: "5",
    title: "YouTube - Music Playlist",
    url: "https://youtube.com/playlist/music",
    favicon: "📺",
    category: "Entertainment",
    isDuplicate: true,
  },
  {
    id: "6",
    title: "Amazon - Laptop Stand",
    url: "https://amazon.com/laptop-stand",
    favicon: "📦",
    category: "Shopping",
  },
  {
    id: "7",
    title: "Medium - AI Research Paper",
    url: "https://medium.com/ai-research",
    favicon: "📝",
    category: "Research",
  },
  {
    id: "8",
    title: "ArXiv - Machine Learning",
    url: "https://arxiv.org/abs/ml-paper",
    favicon: "📄",
    category: "Research",
  },
  {
    id: "9",
    title: "Spotify Web Player",
    url: "https://open.spotify.com",
    favicon: "🎵",
    category: "Entertainment",
  },
]
const categoryColors = {
  Work: "bg-blue-100 text-blue-800 border-blue-200",
  Research: "bg-purple-100 text-purple-800 border-purple-200",
  Entertainment: "bg-green-100 text-green-800 border-green-200",
  Shopping: "bg-orange-100 text-orange-800 border-orange-200",
  Social: "bg-pink-100 text-pink-800 border-pink-200",
  News: "bg-gray-100 text-gray-800 border-gray-200",
  Other: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const exampleCommands = [
  "Close all YouTube tabs",
  "Group all work-related tabs",
  "Find duplicate tabs",
  "Close tabs I haven't used in 30 minutes",
  "Bookmark all research tabs",
  "Show me tabs from today",
  "Close all shopping tabs",
  "Group tabs by domain",
]

const smartSuggestions = [
  "Close 3 entertainment tabs to focus on work",
  "Merge 2 duplicate YouTube tabs",
  "Bookmark 5 research tabs for later",
  "Group 4 work tabs together",
]

export default function TabMateUI() {
  const [command, setCommand] = useState("")
  const [tabs, setTabs] = useState<Tab[]>([])
  const [selectedTabs, setSelectedTabs] = useState<string[]>([])
  const [commandHistory, setCommandHistory] = useState<AICommand[]>([])
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const commandInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Add these state variables
  const [isProcessing, setIsProcessing] = useState(false);

  // Example list of URLs to send to backend
  const urlList = [
    "https://medium.com/ai-research"
  ]

  // Fetch categorized tabs from backend on mount
  useEffect(() => {
    setLoading(true)
    fetch("http://127.0.0.1:5000/api/categorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: urlList }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch tabs from backend")
        const data = await res.json()
        setTabs(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])


  // Group tabs by category
  const groupedTabs = tabs.reduce(
    (groups, tab) => {
      const category = tab.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(tab)
      return groups
    },
    {} as Record<string, Tab[]>,
  )

  const tabGroups: TabGroup[] = Object.entries(groupedTabs).map(([category, tabs]) => ({
    category,
    icon: categoryIcons[category as keyof typeof categoryIcons] || FolderOpen,
    color: categoryColors[category as keyof typeof categoryColors] || categoryColors.Other,
    tabs,
  }))

  const recommendations = [
    {
      type: "duplicate",
      message: "Found 2 YouTube tabs - consider merging",
      action: "Merge duplicates",
      count: 2,
    },
    {
      type: "distraction",
      message: "Entertainment tabs detected during work hours",
      action: "Close distractions",
      count: 3,
    },
    {
      type: "organize",
      message: "8 tabs could be bookmarked for later",
      action: "Bookmark & close",
      count: 8,
    },
  ]

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Auto-focus command input when palette opens
  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus()
    }
  }, [showCommandPalette])

  // Filter suggestions based on input
  useEffect(() => {
    if (command.length > 0) {
      const filtered = exampleCommands.filter((cmd) => cmd.toLowerCase().includes(command.toLowerCase()))
      setSuggestions(filtered.slice(0, 4))
    } else {
      setSuggestions([])
    }
  }, [command])

  // Replace the existing handleCommand with this
  const handleCommand = async (cmd: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          currentTabs: tabs
        }),
      });

      if (!response.ok) {
        throw new Error(`Command failed: ${response.status}`);
      }

      const updatedTabs = await response.json();
      setTabs(updatedTabs);
      
      // Add to command history
      setCommandHistory(prev => [{
        text: cmd,
        timestamp: new Date(),
        result: "Processed successfully"
      }, ...prev.slice(0, 9)]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute command');
    } finally {
      setIsProcessing(false);
      setCommand("");
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice recognition would be implemented here
  }

  const toggleTabSelection = (tabId: string) => {
    setSelectedTabs((prev) => (prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId]))
  }

  const closeSelectedTabs = () => {
    setTabs((prev) => prev.filter((tab) => !selectedTabs.includes(tab.id)))
    setSelectedTabs([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">TabMate</h1>
              <p className="text-sm text-gray-500">AI-powered tab management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              {tabs.length} tabs open
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-73px)]">
          <div className="p-4">
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-organize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={closeSelectedTabs}
                  disabled={selectedTabs.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Close selected ({selectedTabs.length})
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create group
                </Button>
              </div>
            </div>

            {/* Command History */}
            {commandHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Recent Commands
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {commandHistory.slice(0, 5).map((cmd, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => setCommand(cmd.text)}
                      >
                        <p className="text-gray-900 truncate">{cmd.text}</p>
                        <p className="text-gray-500 mt-1">
                          {cmd.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">AI Recommendations</h3>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">{rec.message}</p>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                            {rec.action}
                          </Button>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {rec.count}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Prominent Command Interface */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-blue-600" />
                    AI Command Center
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tell TabMate what you want to do with your tabs in natural language
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommandPalette(true)}
                  className="flex items-center space-x-2"
                >
                  <CommandIcon className="w-4 h-4" />
                  <span>⌘K</span>
                </Button>
              </div>
              <div className="relative">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Try: 'Close all YouTube tabs' or 'Group work tabs together'"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && command && handleCommand(command)}
                      className="pl-11 pr-12 h-12 text-base border-2 border-blue-200 focus:border-blue-400"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={toggleVoiceInput}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Mic className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <Button onClick={() => command && handleCommand(command)} disabled={!command} className="h-12 px-6">
                    Execute
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Smart Suggestions */}
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-700">Smart Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {smartSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCommand(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Groups */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tab Groups</h2>
            <p className="text-sm text-gray-600">
              Your tabs have been automatically organized by AI into {tabGroups.length} categories
            </p>
          </div>
          {loading && <div>Loading tabs from backend...</div>}
          {error && <div className="text-red-600">Error: {error}</div>}
          <div className="space-y-6">
            {tabGroups.map((group) => {
              const IconComponent = group.icon
              return (
                <Card key={group.category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <span>{group.category}</span>
                        <Badge className={group.color}>{group.tabs.length} tabs</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FolderOpen className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {group.tabs.map((tab) => (
                        <div
                          key={tab.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedTabs.includes(tab.id)
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                          onClick={() => toggleTabSelection(tab.id)}
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-sm">
                              {tab.favicon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{tab.title}</p>
                              {tab.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                              {tab.isDuplicate && (
                                <Badge variant="destructive" className="text-xs">
                                  Duplicate
                                </Badge>
                              )}
                              {tab.isDistraction && (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  Distraction
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{tab.url}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>

      {/* Command Palette Dialog */}
      <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Command Palette
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={commandInputRef}
                placeholder="What would you like to do with your tabs?"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && command && handleCommand(command)}
                className="pl-11 h-12 text-base"
              />
            </div>

            {suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                      onClick={() => handleCommand(suggestion)}
                    >
                      <span className="text-sm">{suggestion}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Example Commands</h4>
              <div className="grid grid-cols-2 gap-2">
                {exampleCommands.slice(0, 6).map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setCommand(example)}
                    className="justify-start text-left h-auto p-2"
                  >
                    <span className="text-xs">{example}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
