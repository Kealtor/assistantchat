import { Card, CardContent } from "@/components/ui/card";
import { PenTool } from "lucide-react";

interface QuickReflectionWidgetProps {
  placeholder: string;
  onTap: () => void;
  isEditMode?: boolean;
}

export const QuickReflectionWidget = ({ placeholder, onTap, isEditMode = false }: QuickReflectionWidgetProps) => {
  return (
    <Card 
      className={`h-full transition-all flex flex-col overflow-hidden ${!isEditMode ? 'cursor-pointer hover:shadow-md hover:bg-accent/50 active:scale-[0.99]' : ''}`}
      onClick={isEditMode ? undefined : onTap}
    >
      <CardContent className="p-4 flex-1 flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <PenTool className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">Quick Reflection</h3>
            <p className="text-sm text-muted-foreground">
              {placeholder}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};