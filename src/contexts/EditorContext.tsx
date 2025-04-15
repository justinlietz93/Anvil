import React, { createContext, useState, useContext, ReactNode } from 'react';

// Editor view modes
export type EditorViewMode = 'design' | 'preview' | 'code';

// Editor selection types
interface SelectionState {
  selectedItems: string[];
  hoveredItem: string | null;
  copiedItems: string[];
}

// History state for undo/redo
interface HistoryState {
  past: any[];
  future: any[];
}

// Editor context type definition
interface EditorContextType {
  // Editor view state
  viewMode: EditorViewMode;
  setViewMode: (mode: EditorViewMode) => void;
  
  // Selection state
  selection: SelectionState;
  selectItem: (id: string, addToSelection?: boolean) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  setHoveredItem: (id: string | null) => void;
  
  // Copy, cut, paste operations
  copySelectedItems: () => void;
  cutSelectedItems: () => void;
  pasteItems: (position?: { x: number; y: number }) => void;
  
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  
  // Blueprint editor state
  activeBlueprintId: string | null;
  setActiveBlueprintId: (id: string | null) => void;
  
  // Zoom and positioning
  zoom: number;
  setZoom: (zoom: number) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  
  // Grid and snapping
  gridSize: number;
  setGridSize: (size: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  
  // Editor operations
  groupSelectedItems: () => string | null;
  ungroupItem: (groupId: string) => void;
  alignSelectedItems: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

// Create the default context
const defaultEditorContext: EditorContextType = {
  viewMode: 'design',
  setViewMode: () => {},
  
  selection: { selectedItems: [], hoveredItem: null, copiedItems: [] },
  selectItem: () => {},
  deselectItem: () => {},
  clearSelection: () => {},
  setHoveredItem: () => {},
  
  copySelectedItems: () => {},
  cutSelectedItems: () => {},
  pasteItems: () => {},
  
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  
  activeBlueprintId: null,
  setActiveBlueprintId: () => {},
  
  zoom: 1,
  setZoom: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
  
  gridSize: 8,
  setGridSize: () => {},
  snapToGrid: true,
  setSnapToGrid: () => {},
  
  groupSelectedItems: () => null,
  ungroupItem: () => {},
  alignSelectedItems: () => {}
};

// Create the Editor context
export const EditorContext = createContext<EditorContextType>(defaultEditorContext);

// EditorProvider props
interface EditorProviderProps {
  children: ReactNode;
}

/**
 * Editor Context Provider
 * 
 * Manages the state and operations for the editor
 */
export const EditorProvider = ({ children }: EditorProviderProps) => {
  // Editor view state
  const [viewMode, setViewMode] = useState<EditorViewMode>('design');
  
  // Selection state
  const [selection, setSelection] = useState<SelectionState>({
    selectedItems: [],
    hoveredItem: null,
    copiedItems: []
  });
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: []
  });
  
  // Blueprint editor state
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
  
  // Zoom and positioning
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Grid and snapping
  const [gridSize, setGridSize] = useState<number>(8);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  
  /**
   * Select an item in the editor
   */
  const selectItem = (id: string, addToSelection = false): void => {
    setSelection(prev => {
      if (addToSelection) {
        // If already selected, do nothing
        if (prev.selectedItems.includes(id)) {
          return prev;
        }
        
        // Add to the selection
        return {
          ...prev,
          selectedItems: [...prev.selectedItems, id]
        };
      }
      
      // Replace the selection
      return {
        ...prev,
        selectedItems: [id]
      };
    });
  };
  
  /**
   * Deselect an item in the editor
   */
  const deselectItem = (id: string): void => {
    setSelection(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter(item => item !== id)
    }));
  };
  
  /**
   * Clear the selection
   */
  const clearSelection = (): void => {
    setSelection(prev => ({
      ...prev,
      selectedItems: []
    }));
  };
  
  /**
   * Set the hovered item
   */
  const setHoveredItem = (id: string | null): void => {
    setSelection(prev => ({
      ...prev,
      hoveredItem: id
    }));
  };
  
  /**
   * Copy selected items
   */
  const copySelectedItems = (): void => {
    setSelection(prev => ({
      ...prev,
      copiedItems: [...prev.selectedItems]
    }));
  };
  
  /**
   * Cut selected items
   */
  const cutSelectedItems = (): void => {
    copySelectedItems();
    // Actual deletion would be handled by the ProjectContext
    // We'd call a method to delete the items from the project
  };
  
  /**
   * Paste copied items
   */
  const pasteItems = (position?: { x: number; y: number }): void => {
    // Actual pasting would be handled by the ProjectContext
    // We'd call a method to clone the copied items in the project
    console.log('Pasting items at position:', position);
    console.log('Items to paste:', selection.copiedItems);
  };
  
  /**
   * Determine if undo is available
   */
  const canUndo = history.past.length > 0;
  
  /**
   * Determine if redo is available
   */
  const canRedo = history.future.length > 0;
  
  /**
   * Perform an undo operation
   */
  const undo = (): void => {
    if (!canUndo) return;
    
    const newPast = [...history.past];
    const lastState = newPast.pop();
    
    // Here we would apply the lastState to whatever state in our application
    // For now, we'll just log it
    console.log('Undoing to state:', lastState);
    
    setHistory({
      past: newPast,
      future: [/* current state would go here */, ...history.future]
    });
  };
  
  /**
   * Perform a redo operation
   */
  const redo = (): void => {
    if (!canRedo) return;
    
    const newFuture = [...history.future];
    const nextState = newFuture.shift();
    
    // Here we would apply the nextState to whatever state in our application
    // For now, we'll just log it
    console.log('Redoing to state:', nextState);
    
    setHistory({
      past: [...history.past, /* current state would go here */],
      future: newFuture
    });
  };
  
  /**
   * Group selected items
   */
  const groupSelectedItems = (): string | null => {
    if (selection.selectedItems.length < 2) {
      return null;
    }
    
    // In a real implementation, this would create a new group in the project
    const groupId = `group_${Date.now()}`;
    console.log('Creating group with ID:', groupId);
    console.log('Items in group:', selection.selectedItems);
    
    return groupId;
  };
  
  /**
   * Ungroup an item
   */
  const ungroupItem = (groupId: string): void => {
    // In a real implementation, this would ungroup the items in the project
    console.log('Ungrouping items in group:', groupId);
  };
  
  /**
   * Align selected items
   */
  const alignSelectedItems = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void => {
    if (selection.selectedItems.length < 2) {
      return;
    }
    
    // In a real implementation, this would align the items in the project
    console.log('Aligning items:', selection.selectedItems);
    console.log('Alignment:', alignment);
  };
  
  return (
    <EditorContext.Provider value={{
      viewMode,
      setViewMode,
      
      selection,
      selectItem,
      deselectItem,
      clearSelection,
      setHoveredItem,
      
      copySelectedItems,
      cutSelectedItems,
      pasteItems,
      
      canUndo,
      canRedo,
      undo,
      redo,
      
      activeBlueprintId,
      setActiveBlueprintId,
      
      zoom,
      setZoom,
      position,
      setPosition,
      
      gridSize,
      setGridSize,
      snapToGrid,
      setSnapToGrid,
      
      groupSelectedItems,
      ungroupItem,
      alignSelectedItems
    }}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use the Editor context
export const useEditor = () => useContext(EditorContext);
