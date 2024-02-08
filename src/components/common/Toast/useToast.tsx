import { Toast } from './Toast';
import { useEffect, useState } from 'react';

const TOAST_REMOVE_DELAY = 3000;

interface Toast {
  id: string;
  message: string | React.ReactNode;
  show: boolean;
}

let toasts: Toast[] = [];
let count = 0;

const genId = () => {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
};

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(toasts: Toast[]) => void> = [];

const toast = (message: string | React.ReactNode) => {
  const id = genId();

  listeners.forEach((listener) => {
    if (!toasts.find((toast) => toast.id === id)) {
      toasts = [...toasts, { id, message, show: true }];
    }
    listener(toasts);

    const timeout = setTimeout(() => {
      toasts = toasts.map((toast) => {
        return toast.id === id ? { ...toast, show: false } : toast;
      });
      listener(toasts);

      const maxTimeoutId =
        !!timeouts.size && [...timeouts.entries()]?.reduce((a, b) => (b[1] > a[1] ? b : a))[0];

      if (maxTimeoutId === id) {
        toasts = [];
        timeouts.clear();
      }
    }, TOAST_REMOVE_DELAY);

    timeouts.set(id, timeout);
  });
};

export const useToast = () => {
  const [state, setState] = useState(toasts);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toast,
    toasts: state,
  };
};
