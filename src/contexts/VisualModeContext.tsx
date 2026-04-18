import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useContent } from './ContentContext';

interface VisualModeCtx {
  enhanced: boolean;
  toggle: () => void;
  setEnhanced: (v: boolean) => void;
}

const Ctx = createContext<VisualModeCtx>({ enhanced: false, toggle: () => {}, setEnhanced: () => {} });

export function VisualModeProvider({ children }: { children: ReactNode }) {
  const { content } = useContent();

  const [enhanced, setEnhancedState] = useState(() => {
    const stored = localStorage.getItem('visualMode');
    if (stored !== null) return stored === 'enhanced';
    return content.settings?.enhancedVisuals ?? false;
  });

  // When server content loads (async) and no explicit user preference exists, adopt server default
  useEffect(() => {
    if (localStorage.getItem('visualMode') === null) {
      setEnhancedState(content.settings?.enhancedVisuals ?? false);
    }
  }, [content.settings?.enhancedVisuals]);

  useEffect(() => {
    document.documentElement.classList.toggle('enhanced', enhanced);
    localStorage.setItem('visualMode', enhanced ? 'enhanced' : 'default');
  }, [enhanced]);

  const toggle = () => setEnhancedState(v => !v);

  const setEnhanced = (v: boolean) => {
    setEnhancedState(v);
    // Clear explicit override so server default takes precedence next load
    // Actually keep it so user preference persists; admin changes are server-side
  };

  return (
    <Ctx.Provider value={{ enhanced, toggle, setEnhanced }}>
      {children}
    </Ctx.Provider>
  );
}

export const useVisualMode = () => useContext(Ctx);
