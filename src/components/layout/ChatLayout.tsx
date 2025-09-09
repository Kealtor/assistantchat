import { useState, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "../chat/ChatArea";
import { JournalArea } from "../journal/JournalArea";
import { UserSettings } from "../user/UserSettings";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { chatService, ChatSession as ServiceChatSession } from "@/services/chatService";
import { userService } from "@/services/userService";

type ViewMode = "chat" | "journal" | "user";

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

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    const success = await chatService.deleteChat(chatId);
    if (success) {
      setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    }
  };

  const togglePinChat = async (chatId: string) => {
    if (!user) return;
    
    const chat = chatSessions.find(c => c.id === chatId);
    if (!chat) return;
    
    const updatedChat = await chatService.updateChat(chatId, { 
      pinned: !chat.pinned 
    });
    
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
          onDeleteChat={deleteChat}
          onTogglePinChat={togglePinChat}
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
              variant={currentView === "user" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("user")}
              className="h-9"
            >
              <User className="h-4 w-4 mr-2" />
              User
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={async () => {
                await chatService.signOut();
                window.location.href = '/auth';
              }}
              className="h-9"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
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
          {currentView === "user" && (
            <UserSettings />
          )}
        </div>
      </div>
    </div>
  );
};