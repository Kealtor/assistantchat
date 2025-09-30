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
      <div className="min-h-screen h-screen overflow-auto bg-background">
        <div className="flex items-center justify-center p-space-md md:p-space-xl min-h-full">
          <div className="w-full max-w-4xl">
            <div className="space-y-space-lg md:space-y-space-xl">
              <div className="text-center md:text-left px-space-sm">
                <h1 className="text-size-xl md:text-size-2xl font-bold tracking-tight">Welcome to Chat AI</h1>
                <p className="text-size-base md:text-size-lg text-muted-foreground mt-space-sm">
                  Your intelligent chat assistant for various workflows
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-space-md justify-center md:justify-start px-space-sm">
                <Button 
                  onClick={() => setLocation("/auth")} 
                  size="lg" 
                  className="w-full sm:w-auto min-h-touch"
                >
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