import React, { useState, useEffect } from 'react';
import { subscribeToToasts } from '../utils/toastNotification';
import './toast.css';

export default function ToastContainer() {
  const [toasts, setToasts] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeToToasts((event) => {
      if (event.action === 'add') {
        setToasts(prev => ({
          ...prev,
          [event.toast.id]: event.toast
        }));
      } else if (event.action === 'remove') {
        setToasts(prev => {
          const updated = { ...prev };
          delete updated[event.id];
          return updated;
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="toast-container">
      {Object.values(toasts).map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <span className="toast-icon">✓</span>}
            {toast.type === 'error' && <span className="toast-icon">✕</span>}
            {toast.type === 'info' && <span className="toast-icon">ℹ</span>}
            {toast.type === 'warning' && <span className="toast-icon">⚠</span>}
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
