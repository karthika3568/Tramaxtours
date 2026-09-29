import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import ToastContainer from '../components/ui/Toast';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title = '', message = '', duration = 4000 }) => {
      const id = ++idCounter;
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (message, title = 'Success', duration = 4000) =>
        addToast({ type: 'success', title, message, duration }),
      error: (message, title = 'Error', duration = 5000) =>
        addToast({ type: 'error', title, message, duration }),
      warning: (message, title = 'Warning', duration = 4000) =>
        addToast({ type: 'warning', title, message, duration }),
      info: (message, title = 'Information', duration = 4000) =>
        addToast({ type: 'info', title, message, duration }),
      custom: addToast,
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
