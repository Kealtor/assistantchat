import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface RecentJournalWidgetProps {
  snippet: string;
  onTap: () => void;
}

export const RecentJournalWidget = ({ snippet, onTap }: RecentJournalWidgetProps) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:bg-accent/50 active:scale-[0.99]"
      onClick={onTap}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium mb-1">Recent Journal Entry</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {snippet}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};