import { useState, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "../chat/ChatArea";
import { JournalArea } from "../journal/JournalArea";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { chatService, ChatSession as ServiceChatSession } from "@/services/chatService";

type ViewMode = "chat" | "journal" | "settings";

type ChatSession = ServiceChatSession & {
  createdAt: Date;
  updatedAt: Date;
};

export const ChatLayout = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState("assistant");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Load user's chats when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  const loadUserChats = async () => {
    if (!user) return;
    
    const chats = await chatService.getUserChats(user.id);
    setChatSessions(chats.map(chat => ({
      ...chat,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at
    })));
  };

  const createNewChat = async () => {
    if (!user) return;

    const newChat = await chatService.createChat({
      title: "New Chat",
      workflow: activeWorkflow,
      chat_type: activeWorkflow,
      user_id: user.id
    });
    
    if (newChat) {
      const mappedChat = {
        ...newChat,
        createdAt: newChat.created_at,
        updatedAt: newChat.updated_at
      };
      setChatSessions(prev => [mappedChat, ...prev]);
      setActiveChatId(newChat.id);
      setCurrentView("chat");
    }
  };

  const updateChatSession = async (chatId: string, updates: { messages?: any[], title?: string }) => {
    if (!user) return;

    const updatedChat = await chatService.updateChat(chatId, updates);
    if (updatedChat) {
      const mappedChat = {
        ...updatedChat,
        createdAt: updatedChat.created_at,
        updatedAt: updatedChat.updated_at
      };
      setChatSessions(prev =>
        prev.map(chat =>
          chat.id === chatId ? mappedChat : chat
        )
      );
    }
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setCurrentView("chat");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <p className="text-muted-foreground">You need to be authenticated to access the chat system.</p>
        </div>
      </div>
    );
  }

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