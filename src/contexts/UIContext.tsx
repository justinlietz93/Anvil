import React, { createContext } from 'react';

// Define the UI context type
interface UIContextType {
  selectedComponentIds: string[];
  activePanel: string;
  setSelectedComponentIds: (ids: string[]) => void;
  setActivePanel: (panel: string) => void;
}

// Create the UI context with default values
export const UIContext = createContext<UIContextType>({
  selectedComponentIds: [],
  activePanel: 'design',
  setSelectedComponentIds: () => {},
  setActivePanel: () => {},
});
