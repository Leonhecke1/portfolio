import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our navigation context
interface NavigationContextType {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

// Create the context with a default (though unused) value
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Define the type for the props of the NavigationProvider
interface NavigationProviderProps {
  children: ReactNode;
}

// NavigationProvider component
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <NavigationContext.Provider value={{ isMenuOpen, toggleMenu }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
