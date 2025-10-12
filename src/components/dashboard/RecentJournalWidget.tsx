import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface RecentJournalWidgetProps {
  snippet: string;
  onTap: () => void;
  isEditMode?: boolean;
}

export const RecentJournalWidget = ({ snippet, onTap, isEditMode = false }: RecentJournalWidgetProps) => {
  return (
    <Card 
      className={`h-full transition-all shadow-md flex flex-col overflow-hidden ${!isEditMode ? 'cursor-pointer hover:shadow-lg hover:bg-accent/50 active:scale-[0.99]' : ''}`}
      onClick={isEditMode ? undefined : onTap}
    >
      <CardContent className="p-6 flex-1 flex items-start">
        <div className="flex items-start gap-3 w-full">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col pb-4">
            <h3 className="font-medium mb-2 text-lg">Recent Journal Entry</h3>
            <p className="text-muted-foreground line-clamp-3 leading-relaxed">
              {snippet}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};