
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { ...newToast, id }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismiss(id);
    }, 4000);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border min-w-80 ${
            toast.variant === 'error' ? 'bg-red-50 border-red-200' :
            toast.variant === 'success' ? 'bg-green-50 border-green-200' :
            toast.variant === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-white border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-sm">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
