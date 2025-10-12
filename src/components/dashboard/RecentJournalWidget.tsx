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
      <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold flex-1">Recent Journal Entry</h3>
        </div>
        <div className="flex-1 overflow-hidden pl-[52px]">
          <p className="text-base text-muted-foreground leading-relaxed h-full overflow-hidden">
            {snippet}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};