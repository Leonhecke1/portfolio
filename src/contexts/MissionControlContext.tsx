import React, { createContext, useContext, useState, ReactNode } from 'react';

// New Color Palette - Based on User Inspiration
export const THEME = {
  // Primary (Neon/Glow)
  sandGold: '#fed992',      // Sand/Gold for highlights
  teal: '#50b093',          // Teal for primary UI
  turquoise: '#2199a2',     // Turquoise for accents

  // Background
  deepSpace: '#0a0a1a',     // Deep Space Blue/Black
  darkBlue: '#2b577a',      // Dark Blue accents
  mutedPurple: '#3b2f5a',    // Muted Purple

  // Semantic
  warning: '#ff6b6b',
  success: '#50b093',
  textPrimary: '#e8e8e8',
  textSecondary: '#8899aa',

  // Glows
  glowGold: '0 0 20px #fed992, 0 0 40px #fed99240',
  glowTeal: '0 0 20px #50b093, 0 0 40px #50b09340',
  glowTurquoise: '0 0 20px #2199a2, 0 0 40px #2199a240',

  // Panel backgrounds
  panelBg: 'rgba(10, 10, 26, 0.75)',
  panelBorder: 'rgba(80, 176, 147, 0.2)',
};

interface ThemeContextType {
  activeSector: string;
  setActiveSector: (sector: string) => void;
  isBooting: boolean;
  setIsBooting: (booting: boolean) => void;
  warpFactor: number;
  setWarpFactor: (factor: number) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSector, setActiveSector] = useState('home');
  const [isBooting, setIsBooting] = useState(true);
  const [warpFactor, setWarpFactor] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        activeSector,
        setActiveSector,
        isBooting,
        setIsBooting,
        warpFactor,
        setWarpFactor,
        isFocused,
        setIsFocused,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
