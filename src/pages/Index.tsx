import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/layout/ChatLayout";

const Index = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

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
      <div className="h-screen overflow-auto">
        <div className="flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl">
            <div className="space-y-6 md:space-y-8">
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to Chat AI</h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-2">
                  Your intelligent chat assistant for various workflows
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button onClick={() => setLocation("/auth")} size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </div>
            </div>
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