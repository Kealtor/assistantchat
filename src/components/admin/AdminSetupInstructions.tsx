import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, UserCheck } from "lucide-react";

export const AdminSetupInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Setup Instructions
        </CardTitle>
        <CardDescription>
          How to grant admin access to users in your Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Setting Up Admin Users
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Go to your Supabase dashboard → SQL Editor
            </li>
            <li>
              Run this SQL command to make a user an admin:
              <div className="mt-2 p-3 bg-background rounded border font-mono text-xs">
                UPDATE public.profiles<br/>
                SET is_admin = TRUE<br/>
                WHERE user_id = 'USER_ID_HERE';
              </div>
            </li>
            <li>
              Replace <Badge variant="secondary" className="mx-1">USER_ID_HERE</Badge> with the actual user ID from Authentication → Users
            </li>
            <li>
              The user will immediately have admin access to grant workflow permissions
            </li>
          </ol>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Admin Capabilities
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Access to the Admin tab in user settings</li>
            <li>Grant workflow permissions to other users</li>
            <li>View workflow permission management interface</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Security Note:</strong> Only grant admin access to trusted users. 
          Admins can control who has access to different workflows in your application.
        </div>
      </CardContent>
    </Card>
  );
};