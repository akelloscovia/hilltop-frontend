// Simple toast notification system
let toastId = 0;
const listeners = new Set();

export const createToast = (message, type = 'info', duration = 3000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  
  listeners.forEach(listener => listener({ action: 'add', toast }));
  
  if (duration > 0) {
    setTimeout(() => {
      listeners.forEach(listener => listener({ action: 'remove', id }));
    }, duration);
  }
  
  return id;
};

export const success = (message, duration = 3000) => createToast(message, 'success', duration);
export const error = (message, duration = 4000) => createToast(message, 'error', duration);
export const info = (message, duration = 3000) => createToast(message, 'info', duration);
export const warning = (message, duration = 3500) => createToast(message, 'warning', duration);

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
