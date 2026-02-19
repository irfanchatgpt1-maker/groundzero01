import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionMode = 'cloud' | 'lan' | 'forced-lan';

interface ConnectionState {
  mode: ConnectionMode;
  isOnline: boolean;
  forceLan: boolean;
  lanApiBase: string;
  cloudApiBase: string;
  setForceLan: (force: boolean) => void;
  setLanApiBase: (url: string) => void;
  activeApiBase: string;
  pendingSyncCount: number;
  setPendingSyncCount: React.Dispatch<React.SetStateAction<number>>;
}

const ConnectionContext = createContext<ConnectionState | null>(null);

const FORCE_LAN_KEY = 'groundzero_force_lan';
const LAN_API_KEY = 'groundzero_lan_api_base';
const DEFAULT_LAN_API = 'http://192.168.1.100:3001';

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceLan, setForceLanState] = useState(() => localStorage.getItem(FORCE_LAN_KEY) === 'true');
  const [lanApiBase, setLanApiBaseState] = useState(() => localStorage.getItem(LAN_API_KEY) || DEFAULT_LAN_API);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const cloudApiBase = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const setForceLan = useCallback((force: boolean) => {
    setForceLanState(force);
    localStorage.setItem(FORCE_LAN_KEY, String(force));
  }, []);

  const setLanApiBase = useCallback((url: string) => {
    setLanApiBaseState(url);
    localStorage.setItem(LAN_API_KEY, url);
  }, []);

  const mode: ConnectionMode = forceLan ? 'forced-lan' : isOnline ? 'cloud' : 'lan';
  const activeApiBase = mode === 'cloud' ? cloudApiBase : lanApiBase;

  return (
    <ConnectionContext.Provider value={{
      mode, isOnline, forceLan, lanApiBase, cloudApiBase,
      setForceLan, setLanApiBase, activeApiBase,
      pendingSyncCount, setPendingSyncCount,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within ConnectionProvider');
  return ctx;
}
