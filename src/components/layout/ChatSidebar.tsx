import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  BookOpen,
  Settings,
  MoreVertical 
} from "lucide-react";

type Workflow = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

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

interface ChatSidebarProps {
  workflows: Workflow[];
  activeWorkflow: string;
  onWorkflowChange: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onCreateNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export const ChatSidebar = ({
  workflows,
  activeWorkflow,
  onWorkflowChange,
  collapsed,
  onToggleCollapse,
  currentView,
  onViewChange,
  chatSessions,
  activeChatId,
  onCreateNewChat,
  onSelectChat,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const filteredHistory = chatSessions.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    chat.workflow === activeWorkflow
  );

  if (collapsed) {
    return (
      <div className="flex flex-col h-full p-2">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="mb-4 self-center h-10 w-10 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Workflows */}
        <div className="space-y-2 mb-4">
          {workflows.map((workflow) => (
            <Button
              key={workflow.id}
              variant={activeWorkflow === workflow.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onWorkflowChange(workflow.id)}
              className="w-full h-10 p-0 text-lg"
            >
              {workflow.emoji}
            </Button>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* View Toggle */}
        <div className="space-y-2">
          <Button
            variant={currentView === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("chat")}
            className="w-full h-10 p-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === "journal" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("journal")}
            className="w-full h-10 p-0"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === "settings" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("settings")}
            className="w-full h-10 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Assistant Chat</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button className="w-full mb-4" size="sm" onClick={onCreateNewChat}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Workflows */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Workflows
        </h3>
        <div className="space-y-1">
          {workflows.map((workflow) => (
            <Button
              key={workflow.id}
              variant={activeWorkflow === workflow.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onWorkflowChange(workflow.id)}
              className="w-full justify-start h-9"
            >
              <span className="mr-3 text-base">{workflow.emoji}</span>
              {workflow.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Recent Chats
          </h3>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`group flex items-center justify-between p-3 hover:bg-accent rounded-md cursor-pointer transition-colors ${
                    activeChatId === chat.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(chat.updatedAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
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
    </div>
  );
};