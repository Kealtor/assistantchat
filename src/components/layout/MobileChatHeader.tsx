import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  Search, 
  LogOut, 
  MoreVertical,
  Pin,
  Trash2,
  MessageSquare,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { userService, UserPermission } from "@/services/userService";

type Workflow = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

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
  pinned?: boolean;
};

interface MobileChatHeaderProps {
  workflows: Workflow[];
  activeWorkflow: string;
  onWorkflowChange: (id: string) => void;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onCreateNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onTogglePinChat: (chatId: string) => void;
  onSignOut: () => void;
}

export const MobileChatHeader = ({
  workflows,
  activeWorkflow,
  onWorkflowChange,
  chatSessions,
  activeChatId,
  onCreateNewChat,
  onSelectChat,
  onDeleteChat,
  onTogglePinChat,
  onSignOut,
}: MobileChatHeaderProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [allowedWorkflows, setAllowedWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
    }
  }, [user]);

  useEffect(() => {
    // Filter workflows based on permissions or admin status
    const filtered = isAdmin 
      ? workflows 
      : workflows.filter(workflow => {
          return userPermissions.some(perm => perm.workflow_id === workflow.id);
        });
    setAllowedWorkflows(filtered);
  }, [workflows, userPermissions, isAdmin]);

  const loadUserPermissions = async () => {
    if (!user) return;
    
    const permissions = await userService.getUserPermissions(user.id);
    setUserPermissions(permissions);
  };

  // Prevent autofocus when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      // Delay to ensure the sheet has opened, then blur any focused input
      const timer = setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
          activeElement.blur();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sheetOpen]);
  
  const currentWorkflow = allowedWorkflows.find(w => w.id === activeWorkflow);
  const activeChat = activeChatId ? chatSessions.find(chat => chat.id === activeChatId) : null;
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const filteredHistory = chatSessions
    .filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      chat.workflow === activeWorkflow
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const getLastMessage = (chat: ChatSession) => {
    if (!chat.messages || chat.messages.length === 0) return "No messages yet";
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? "..." : "");
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-lg mb-4">Assistant Chat</h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus={false}
                  />
                </div>

                {/* Workflow Selector */}
                <Select value={activeWorkflow} onValueChange={onWorkflowChange}>
                  <SelectTrigger>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{currentWorkflow?.emoji}</span>
                      <SelectValue>{currentWorkflow?.name}</SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {allowedWorkflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        <div className="flex items-center gap-3">
                          <span className="text-base">{workflow.emoji}</span>
                          <span>{workflow.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* New Chat Button */}
                <Button className="w-full mt-4" size="sm" onClick={() => {
                  onCreateNewChat();
                  setSheetOpen(false);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>

              {/* Chat History */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 pb-2 flex-shrink-0">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Recent Chats
                  </h3>
                </div>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-1 pb-4">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => {
                            onSelectChat(chat.id);
                            setSheetOpen(false);
                          }}
                          className={cn(
                            "group flex items-start p-3 hover:bg-accent rounded-md cursor-pointer transition-colors",
                            activeChatId === chat.id && "bg-accent"
                          )}
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                {chat.pinned && <Pin className="h-3 w-3 text-primary" />}
                                <p className="text-sm font-medium truncate">{chat.title}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(chat.updatedAt)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {getLastMessage(chat)}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onTogglePinChat(chat.id)}>
                                <Pin className="h-4 w-4 mr-2" />
                                {chat.pinned ? "Unpin" : "Pin"} Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteChat(chat.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No chats found</p>
                        <p className="text-xs text-muted-foreground mt-1">Start a new conversation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <Button variant="ghost" onClick={onSignOut} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center space-x-2 min-w-0 flex-1 ml-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
            currentWorkflow?.color
          )}>
            {currentWorkflow?.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-medium text-base truncate">
              {activeChat?.title || currentWorkflow?.name}
            </h1>
            {activeChat && (
              <p className="text-xs text-muted-foreground truncate">
                {formatTimestamp(activeChat.updatedAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};