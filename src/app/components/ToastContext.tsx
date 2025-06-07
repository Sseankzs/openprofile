// src/app/components/ToastContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const ToastContext = createContext<{
  showToast: (msg: string, duration?: number) => void;
}>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-xl z-50">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
