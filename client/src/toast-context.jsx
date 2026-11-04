import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);
const icons = { error: AlertCircle, success: CheckCircle2, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const toast = useCallback((message, type = "info", duration = 4800) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current.slice(-3), { id, message: String(message), type }]);
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-viewport" aria-label="Notifications">
        {toasts.map((item) => {
          const Icon = icons[item.type] || Info;
          return (
            <div className={`app-toast app-toast-${item.type}`} key={item.id} role={item.type === "error" ? "alert" : "status"}>
              <Icon aria-hidden="true" size={20} />
              <span>{item.message}</span>
              <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}><X size={17} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context.toast;
}
