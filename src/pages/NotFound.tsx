import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const [location] = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-space-md safe-area-inset-bottom">
      <div className="text-center space-y-space-lg p-space-md max-w-md">
        <div className="space-y-space-sm">
          <h1 className="text-size-3xl md:text-6xl font-bold tracking-tight text-primary">404</h1>
          <p className="text-size-lg md:text-size-xl text-muted-foreground">Oops! Page not found</p>
          <p className="text-size-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <Button asChild className="min-h-touch">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};
export default NotFound;
