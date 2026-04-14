import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface VisualModeCtx {
  enhanced: boolean;
  toggle: () => void;
}

const Ctx = createContext<VisualModeCtx>({ enhanced: false, toggle: () => {} });

export function VisualModeProvider({ children }: { children: ReactNode }) {
  const [enhanced, setEnhanced] = useState(() =>
    localStorage.getItem('visualMode') === 'enhanced'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('enhanced', enhanced);
    localStorage.setItem('visualMode', enhanced ? 'enhanced' : 'default');
  }, [enhanced]);

  return (
    <Ctx.Provider value={{ enhanced, toggle: () => setEnhanced(v => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useVisualMode = () => useContext(Ctx);
