import React, { createContext, useState, useContext, ReactNode } from 'react';

// Available UI themes
export type Theme = 'light' | 'dark' | 'system';

// Available sections in the application
export type ActiveSection = 
  | 'home'
  | 'blueprint-editor'
  | 'component-library'
  | 'properties-panel'
  | 'settings'
  | 'data-connectivity'
  | 'llm-integration'
  | 'application-export'
  | 'plugin-manager';

// UI Context type definition
interface UIContextType {
  // Theme management
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Active section and navigation
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  
  // Sidebar states
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  
  // Modal management
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Toast notifications
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

// Create the default context
const defaultUIContext: UIContextType = {
  theme: 'system',
  setTheme: () => {},
  
  activeSection: 'home',
  setActiveSection: () => {},
  
  leftSidebarOpen: true,
  setLeftSidebarOpen: () => {},
  rightSidebarOpen: true,
  setRightSidebarOpen: () => {},
  
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
  
  showToast: () => {},
  
  isLoading: false,
  setIsLoading: () => {},
  loadingMessage: '',
  setLoadingMessage: () => {}
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
    return 'system';
  });
  
  // Active section
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  
  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  
  // Modal management
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  /**
   * Set the active theme and store it in localStorage
   */
  const handleSetTheme = (newTheme: Theme): void => {
    setTheme(newTheme);
    localStorage.setItem('anvil-theme', newTheme);
    
    // Apply the theme to the document
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };
  
  /**
   * Open a modal by ID
   */
  const openModal = (modalId: string): void => {
    setActiveModal(modalId);
  };
  
  /**
   * Close the active modal
   */
  const closeModal = (): void => {
    setActiveModal(null);
  };
  
  /**
   * Show a toast notification
   */
  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void => {
    // In a real implementation, this would add a toast to a toast queue
    console.log(`Toast (${type}): ${message}`);
    
    // Simple alert for now
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };
  
  // Apply the theme when the component mounts
  React.useEffect(() => {
    handleSetTheme(theme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);
  
  return (
    <UIContext.Provider value={{
      theme,
      setTheme: handleSetTheme,
      
      activeSection,
      setActiveSection,
      
      leftSidebarOpen,
      setLeftSidebarOpen,
      rightSidebarOpen,
      setRightSidebarOpen,
      
      activeModal,
      openModal,
      closeModal,
      
      showToast,
      
      isLoading,
      setIsLoading,
      loadingMessage,
      setLoadingMessage
    }}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => useContext(UIContext);
