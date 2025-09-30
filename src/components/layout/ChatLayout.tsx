import { useState, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { MobileNavigation } from "./MobileNavigation";
import { MobileChatHeader } from "./MobileChatHeader";
import { ChatArea } from "../chat/ChatArea";
import { JournalArea } from "../journal/JournalArea";
import { HabitsArea } from "../habits/HabitsArea";
import { UserSettings } from "../user/UserSettings";
import { CustomizableDashboard } from "../dashboard/CustomizableDashboard";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, User, LogOut, Target, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { chatService, ChatSession as ServiceChatSession } from "@/services/chatService";
import { userService } from "@/services/userService";
import { getUIWorkflows, getDefaultWorkflow } from "@/config/workflows.config";
import { ViewMode } from "@/types/navigation";

type ChatSession = ServiceChatSession & {
  createdAt: Date;
  updatedAt: Date;
};

export const ChatLayout = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(getDefaultWorkflow().workflowName);
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

  const updateChatSession = async (chatId: string, updates: { messages?: any[], media?: any[], title?: string }) => {
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

  const workflows = getUIWorkflows();

  const currentWorkflow = workflows.find(w => w.id === activeWorkflow);

  const handleSignOut = async () => {
    await chatService.signOut();
    window.location.href = '/auth';
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full bg-background font-inter overflow-hidden">
        {/* Mobile Header - only show for chat view */}
        {currentView === "chat" && (
          <MobileChatHeader
            workflows={workflows}
            activeWorkflow={activeWorkflow}
            onWorkflowChange={setActiveWorkflow}
            chatSessions={chatSessions}
            activeChatId={activeChatId}
            onCreateNewChat={createNewChat}
            onSelectChat={selectChat}
            onDeleteChat={deleteChat}
            onTogglePinChat={togglePinChat}
            onSignOut={handleSignOut}
          />
        )}

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          {currentView === "dashboard" && (
            <CustomizableDashboard onNavigate={setCurrentView} />
          )}
          {currentView === "chat" && (
            <ChatArea 
              workflow={activeWorkflow}
              chatSession={activeChatId ? chatSessions.find(chat => chat.id === activeChatId) || null : null}
              onUpdateChat={updateChatSession}
              onWorkflowChange={setActiveWorkflow}
              onCreateNewChat={createNewChat}
            />
          )}
          {currentView === "journal" && (
            <JournalArea />
          )}
          {currentView === "habits" && (
            <HabitsArea />
          )}
          {currentView === "user" && (
            <UserSettings />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>
    );
  }

  // Desktop Layout - Dashboard has its own full-width layout
  if (currentView === "dashboard") {
    return (
      <div className="h-screen w-full bg-background font-inter overflow-hidden flex flex-col">
        {/* Dashboard Header */}
        <header className="h-16 border-b border-border bg-card px-space-md lg:px-space-lg flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-base font-medium">
              🏠
            </div>
            <div>
              <h1 className="font-semibold text-size-base">Dashboard</h1>
              <p className="text-muted-foreground text-size-xs">Your daily reflection space</p>
            </div>
          </div>
          
          <div className="flex items-center gap-space-xs flex-wrap">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentView("dashboard")}
              className="min-h-touch"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("chat")}
              className="min-h-touch"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("journal")}
              className="min-h-touch"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Journal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("habits")}
              className="min-h-touch"
            >
              <Target className="h-4 w-4 mr-2" />
              Habits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("user")}
              className="min-h-touch"
            >
              <User className="h-4 w-4 mr-2" />
              User
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="min-h-touch"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Dashboard Content - Full Width */}
        <div className="flex-1 overflow-hidden">
          <CustomizableDashboard 
            onNavigate={setCurrentView}
            workflows={workflows}
            activeWorkflow={activeWorkflow}
            onWorkflowChange={setActiveWorkflow}
            onCreateNewChat={createNewChat}
          />
        </div>
      </div>
    );
  }

  // Desktop Layout for non-dashboard views - with sidebar
  return (
    <div className="flex h-screen bg-background font-inter">
      {/* Desktop Sidebar */}
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

      {/* Desktop Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg ${currentWorkflow?.color} flex items-center justify-center text-white text-sm font-medium`}>
              {currentWorkflow?.emoji}
            </div>
            <div>
              <h1 className="font-semibold text-lg">{currentWorkflow?.name}</h1>
              <p className="text-muted-foreground text-sm">{currentWorkflow?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("dashboard")}
              className="h-9"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
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
              variant={currentView === "habits" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("habits")}
              className="h-9"
            >
              <Target className="h-4 w-4 mr-2" />
              Habits
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
              onClick={handleSignOut}
              className="h-9"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Desktop Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === "chat" && (
            <ChatArea 
              workflow={activeWorkflow}
              chatSession={activeChatId ? chatSessions.find(chat => chat.id === activeChatId) || null : null}
              onUpdateChat={updateChatSession}
              onWorkflowChange={setActiveWorkflow}
              onCreateNewChat={createNewChat}
            />
          )}
          {currentView === "journal" && (
            <JournalArea />
          )}
          {currentView === "habits" && (
            <HabitsArea />
          )}
          {currentView === "user" && (
            <UserSettings />
          )}
        </div>
      </div>
    </div>
  );
};