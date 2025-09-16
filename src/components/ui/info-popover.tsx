import * as React from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface InfoPopoverProps {
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const InfoPopover = ({ 
  children, 
  className, 
  iconClassName,
  contentClassName,
  side = "top",
  align = "center"
}: InfoPopoverProps) => {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // For mobile, use popover. For desktop, keep existing behavior
  if (!isMobile) {
    return null; // Let existing tooltip behavior handle desktop
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-5 w-5 p-0 hover:bg-accent/50 rounded-full inline-flex items-center justify-center",
            className
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <Info className={cn("h-3 w-3 text-muted-foreground", iconClassName)} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side={side} 
        align={align}
        className={cn("w-72 text-sm", contentClassName)}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
