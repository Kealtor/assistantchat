import { useState, useEffect } from 'react';

interface UsePersistentCardHeightOptions {
  widgetId: string;
  defaultHeight: number;
}

/**
 * Hook to persist card height in localStorage per widget.
 * Returns current height and setter function.
 */
export const usePersistentCardHeight = ({ 
  widgetId, 
  defaultHeight 
}: UsePersistentCardHeightOptions) => {
  const storageKey = `dashboard-card-height-${widgetId}`;
  
  const [height, setHeight] = useState<number>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? parseInt(stored, 10) : defaultHeight;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, height.toString());
  }, [height, storageKey]);

  const resetHeight = () => {
    localStorage.removeItem(storageKey);
    setHeight(defaultHeight);
  };

  return { height, setHeight, resetHeight };
};
