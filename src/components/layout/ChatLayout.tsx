import { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "../chat/ChatArea";
import { JournalArea } from "../journal/JournalArea";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, Settings } from "lucide-react";

type ViewMode = "chat" | "journal" | "settings";

type ChatSession = {
  id: string;
  title: string;
  workflow: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

export const ChatLayout = () => {
  const [currentView, setCurrentView] = useState<ViewMode>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState("assistant");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      workflow: activeWorkflow,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const updateChatSession = (chatId: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      )
    );
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const workflows = [
    { id: "assistant", name: "Assistant", emoji: "🤖", color: "bg-primary" },
    { id: "calendar", name: "Calendar", emoji: "📅", color: "bg-success" },
    { id: "notes", name: "Notes", emoji: "📝", color: "bg-warning" },
    { id: "tasks", name: "Tasks", emoji: "✅", color: "bg-error" },
    { id: "search", name: "Search", emoji: "🔍", color: "bg-accent" },
  ];

  const currentWorkflow = workflows.find(w => w.id === activeWorkflow);

  return (
    <div className="flex h-screen bg-background font-inter">
      {/* Sidebar */}
      <div className={`transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-80'} border-r border-border bg-surface`}>
        <ChatSidebar
          workflows={workflows}
          activeWorkflow={activeWorkflow}
          onWorkflowChange={setActiveWorkflow}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentView={currentView}
          onViewChange={setCurrentView}
          chatSessions={chatSessions}
          activeChatId={activeChatId}
          onCreateNewChat={createNewChat}
          onSelectChat={selectChat}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg ${currentWorkflow?.color} flex items-center justify-center text-white text-sm font-medium`}>
              {currentWorkflow?.emoji}
            </div>
            <div>
              <h1 className="font-semibold text-lg">{currentWorkflow?.name}</h1>
              <p className="text-muted-foreground text-sm">AI-powered workflow assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("chat")}
              className="h-9"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button
              variant={currentView === "journal" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("journal")}
              className="h-9"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Journal
            </Button>
            <Button
              variant={currentView === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("settings")}
              className="h-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === "chat" && (
            <ChatArea 
              workflow={activeWorkflow}
              chatSession={activeChatId ? chatSessions.find(chat => chat.id === activeChatId) || null : null}
              onUpdateChat={updateChatSession}
            />
          )}
          {currentView === "journal" && (
            <JournalArea />
          )}
          {currentView === "settings" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Settings</h3>
                <p className="text-muted-foreground">Configure your workflows and preferences</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};