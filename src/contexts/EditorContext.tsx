import React, { createContext } from 'react';

// Define the Editor context type
interface EditorContextType {
  undoStack: any[];
  redoStack: any[];
  clipboard: any;
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  cut: () => void;
}

// Create the Editor context with default values
export const EditorContext = createContext<EditorContextType>({
  undoStack: [],
  redoStack: [],
  clipboard: null,
  undo: () => {},
  redo: () => {},
  copy: () => {},
  paste: () => {},
  cut: () => {},
});
