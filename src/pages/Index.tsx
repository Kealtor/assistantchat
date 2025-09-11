import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/layout/ChatLayout";

const Index = () => {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Chat AI</h1>
            <p className="text-xl text-muted-foreground">
              Your intelligent chat assistant for various workflows
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/auth")} size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatLayout />
    </div>
  );
};

export default Index;