'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import SplashScreen from '@/app/components/splashscreen';
import { ToastProvider } from '@/app/components/ToastContext';

const SplashContext = createContext<{
  setSplashVisible: (value: boolean) => void;
}>({
  setSplashVisible: () => {},
});

export function useSplash() {
  return useContext(SplashContext);
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const timeout = setTimeout(() => setInitialLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      setSplashVisible(true);
      const timer = setTimeout(() => {
        setSplashVisible(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname, initialLoading]);

  const contextValue = {
    setSplashVisible,
  };

  return (
    <ToastProvider>
      <SplashContext.Provider value={contextValue}>
        {splashVisible ? <SplashScreen /> : children}
      </SplashContext.Provider>
    </ToastProvider>
  );
}
