import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  const [location, setLocation] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(getDefaultWorkflow().workflowName);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Derive current view from URL
  const currentView: ViewMode = 
    location === "/dashboard" ? "dashboard" :
    location === "/chat" ? "chat" :
    location === "/journal" ? "journal" :
    location === "/habits" ? "habits" :
    location === "/user" ? "user" :
    "dashboard";

  // Navigation helper
  const navigateTo = (view: ViewMode) => {
    setLocation(`/${view}`);
  };

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
      navigateTo("chat");
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
    navigateTo("chat");
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
      <div className="flex flex-col h-screen bg-background font-inter">
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
        <div className="flex-1 overflow-y-auto pb-16">
          {currentView === "dashboard" && (
          <CustomizableDashboard 
            onNavigate={navigateTo}
            workflows={workflows}
            activeWorkflow={activeWorkflow}
            onWorkflowChange={setActiveWorkflow}
            onCreateNewChat={createNewChat}
          />
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
          onViewChange={navigateTo}
        />
      </div>
    );
  }

  // Desktop Layout - Dashboard has its own full-width layout
  if (currentView === "dashboard") {
    return (
      <div className="h-screen bg-background font-inter">
        {/* Dashboard Header */}
        <header className="h-16 border-b border-border bg-card px-3 md:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 hidden lg:flex min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
              🏠
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-lg truncate">Dashboard</h1>
              <p className="text-muted-foreground text-sm truncate">Your daily reflection space</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigateTo("dashboard")}
              className="h-10 px-2 lg:px-3"
            >
              <Home className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("chat")}
              className="h-10 px-2 lg:px-3"
            >
              <MessageSquare className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Chat</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("journal")}
              className="h-10 px-2 lg:px-3"
            >
              <BookOpen className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Journal</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("habits")}
              className="h-10 px-2 lg:px-3"
            >
              <Target className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Habits</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("user")}
              className="h-10 px-2 lg:px-3"
            >
              <User className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">User</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="h-10 px-2 lg:px-3"
            >
              <LogOut className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Content - Full Width */}
        <div className="flex-1 overflow-hidden">
          <CustomizableDashboard 
            onNavigate={navigateTo}
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
          onViewChange={navigateTo}
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
        <header className="h-16 border-b border-border bg-card px-3 md:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 hidden lg:flex min-w-0">
            <div className={`w-8 h-8 rounded-lg ${currentWorkflow?.color} flex items-center justify-center text-white text-sm font-medium shrink-0`}>
              {currentWorkflow?.emoji}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-lg truncate">{currentWorkflow?.name}</h1>
              <p className="text-muted-foreground text-sm truncate">{currentWorkflow?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("dashboard")}
              className="h-10 px-2 md:px-3"
            >
              <Home className="h-5 w-5" />
              <span className="ml-2 hidden xl:inline">Dashboard</span>
            </Button>
            <Button
              variant={currentView === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateTo("chat")}
              className="h-10 px-2 md:px-3"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="ml-2 hidden xl:inline">Chat</span>
            </Button>
            <Button
              variant={currentView === "journal" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateTo("journal")}
              className="h-10 px-2 md:px-3"
            >
              <BookOpen className="h-5 w-5" />
              <span className="ml-2 hidden xl:inline">Journal</span>
            </Button>
            <Button
              variant={currentView === "habits" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateTo("habits")}
              className="h-10 px-2 md:px-3"
            >
              <Target className="h-5 w-5" />
              <span className="ml-2 hidden xl:inline">Habits</span>
            </Button>
            <Button
              variant={currentView === "user" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateTo("user")}
              className="h-10 px-2 md:px-3"
            >
              <User className="h-5 w-5" />
              <span className="ml-2 hidden xl:inline">User</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="h-10 px-2 md:px-3"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2 hidden xl:inline">Sign Out</span>
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