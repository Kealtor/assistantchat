import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface RecentJournalWidgetProps {
  snippet: string;
  onTap: () => void;
}

export const RecentJournalWidget = ({ snippet, onTap }: RecentJournalWidgetProps) => {
  return (
    <Card 
      className="h-full cursor-pointer transition-all hover:shadow-lg hover:bg-accent/50 active:scale-[0.99] shadow-md flex flex-col"
      onClick={onTap}
    >
      <CardContent className="p-6 flex-1 flex items-center">
        <div className="flex items-start gap-3 w-full">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium mb-2 text-lg">Recent Journal Entry</h3>
            <p className="text-muted-foreground line-clamp-4 leading-relaxed">
              {snippet}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};