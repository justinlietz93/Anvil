import React, { createContext, useState, useContext, ReactNode } from 'react';

// Available UI themes
export type Theme = 'light' | 'dark' | 'system';

// Available tabs in the application
export type ActiveTab = 'designer' | 'blueprint' | 'data' | 'llm' | 'plugins' | 'export';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification interface
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

// UI Context type definition
interface UIContextType {
  // Theme management
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Active tab and navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Component selection
  selectedComponentIds: string[];
  setSelectedComponentIds: (ids: string[]) => void;
  selectedComponent: any;
  setSelectedComponent: (component: any) => void;
  
  // Panel states
  isPropertiesPanelOpen: boolean;
  setPropertiesPanelOpen: (open: boolean) => void;
  isNodeLibraryOpen: boolean;
  setNodeLibraryOpen: (open: boolean) => void;
  isComponentLibraryOpen: boolean;
  setComponentLibraryOpen: (open: boolean) => void;
  
  // Modal management
  activeModal: string | null;
  openModal: (modalId: string, props?: any) => void;
  closeModal: () => void;
  modalProps: any;
  
  // Notifications
  notifications: Notification[];
  showNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create the default context
const defaultUIContext: UIContextType = {
  theme: 'dark',
  setTheme: () => {},
  
  activeTab: 'designer',
  setActiveTab: () => {},
  
  selectedComponentIds: [],
  setSelectedComponentIds: () => {},
  selectedComponent: null,
  setSelectedComponent: () => {},
  
  isPropertiesPanelOpen: true,
  setPropertiesPanelOpen: () => {},
  isNodeLibraryOpen: true,
  setNodeLibraryOpen: () => {},
  isComponentLibraryOpen: true,
  setComponentLibraryOpen: () => {},
  
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
  modalProps: {},
  
  notifications: [],
  showNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {}
};

// Create the UI context
export const UIContext = createContext<UIContextType>(defaultUIContext);

// UIProvider props
interface UIProviderProps {
  children: ReactNode;
}

/**
 * UI Context Provider
 * 
 * Manages the state of the UI in the application
 */
export const UIProvider = ({ children }: UIProviderProps) => {
  // Theme management
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to load the theme from local storage
    const savedTheme = localStorage.getItem('anvil-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      return savedTheme as Theme;
    }
    return 'dark';
  });
  
  // Active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('designer');
  
  // Selected components
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  
  // Panel states
  const [isPropertiesPanelOpen, setPropertiesPanelOpen] = useState<boolean>(true);
  const [isNodeLibraryOpen, setNodeLibraryOpen] = useState<boolean>(true);
  const [isComponentLibraryOpen, setComponentLibraryOpen] = useState<boolean>(true);
  
  // Modal management
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalProps, setModalProps] = useState<any>({});
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  /**
   * Set the active theme and store it in localStorage
   */
  const handleSetTheme = (newTheme: Theme): void => {
    setTheme(newTheme);
    localStorage.setItem('anvil-theme', newTheme);
    
    // Apply the theme to the document
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  /**
   * Open a modal by ID
   */
  const openModal = (modalId: string, props: any = {}): void => {
    setActiveModal(modalId);
    setModalProps(props);
  };
  
  /**
   * Close the active modal
   */
  const closeModal = (): void => {
    setActiveModal(null);
    setModalProps({});
  };
  
  /**
   * Show a notification
   */
  const showNotification = (message: string, type: NotificationType = 'info'): void => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove non-error notifications after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  };
  
  /**
   * Remove a notification by ID
   */
  const removeNotification = (id: string): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  /**
   * Clear all notifications
   */
  const clearNotifications = (): void => {
    setNotifications([]);
  };
  
  // Apply the theme when the component mounts
  React.useEffect(() => {
    handleSetTheme(theme);
  }, []);
  
  return (
    <UIContext.Provider value={{
      theme,
      setTheme: handleSetTheme,
      
      activeTab,
      setActiveTab,
      
      selectedComponentIds,
      setSelectedComponentIds,
      selectedComponent,
      setSelectedComponent,
      
      isPropertiesPanelOpen,
      setPropertiesPanelOpen,
      isNodeLibraryOpen,
      setNodeLibraryOpen,
      isComponentLibraryOpen,
      setComponentLibraryOpen,
      
      activeModal,
      openModal,
      closeModal,
      modalProps,
      
      notifications,
      showNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => useContext(UIContext);
