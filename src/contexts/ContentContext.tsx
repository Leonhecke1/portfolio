import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { defaultContent } from '../data/defaultContent';
import type { SiteContent } from '../data/defaultContent';

const CACHE_KEY  = 'portfolio_content_cache_v1';
const API_SECRET = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

/* ── Deep-merge helper ───────────────────────────────────────────── */
function deepMerge<T>(base: T, override: Partial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override) as (keyof T)[]) {
    const val = override[key];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      result[key as string] = val;
    } else if (typeof val === 'object') {
      result[key as string] = deepMerge(
        (base as Record<string, unknown>)[key as string] ?? {},
        val as Record<string, unknown>
      );
    } else {
      result[key as string] = val;
    }
  }
  return result as T;
}

function loadCache(): SiteContent {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return deepMerge(defaultContent, JSON.parse(raw));
  } catch { /* ignore */ }
  return defaultContent;
}

async function apiFetch(): Promise<SiteContent | null> {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function apiSave(content: SiteContent): Promise<void> {
  const res = await fetch('/api/content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(API_SECRET ? { Authorization: `Bearer ${API_SECRET}` } : {}),
    },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((body as { error?: string }).error ?? 'Speichern fehlgeschlagen');
  }
}

/* ── Context ─────────────────────────────────────────────────────── */
interface ContentContextType {
  content: SiteContent;
  updateContent: (patch: Partial<SiteContent>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  syncing: boolean;
  syncError: string | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content,   setContent]   = useState<SiteContent>(loadCache);
  const [syncing,   setSyncing]   = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const contentRef = useRef(content);
  useEffect(() => { contentRef.current = content; }, [content]);

  // Beim Start: Daten vom Server laden und Cache überschreiben
  useEffect(() => {
    apiFetch().then(remote => {
      if (remote) {
        const merged = deepMerge(defaultContent, remote);
        setContent(merged);
        contentRef.current = merged;
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      }
    });
  }, []);

  const updateContent = useCallback(async (patch: Partial<SiteContent>) => {
    // Optimistisches Update — UI reagiert sofort
    const next = deepMerge(contentRef.current, patch);
    setContent(next);
    contentRef.current = next;
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));

    setSyncing(true);
    setSyncError(null);
    try {
      await apiSave(next);
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setSyncing(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setContent(defaultContent);
    contentRef.current = defaultContent;
    localStorage.removeItem(CACHE_KEY);
    setSyncing(true);
    setSyncError(null);
    try {
      await apiSave(defaultContent);
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setSyncing(false);
    }
  }, []);

  return (
    <ContentContext.Provider value={{ content, updateContent, resetToDefaults, syncing, syncError }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
};
