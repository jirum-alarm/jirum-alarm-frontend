import { Toast } from './Toast';
import { useEffect, useState } from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 3000;

interface Toast {
  id: string;
  message: string;
  show: boolean;
}

let toasts: Toast[] = [];
let count = 0;

const genId = () => {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
};

const listeners: Array<(toasts: Toast[]) => void> = [];
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

const toast = (message: string) => {
  const id = genId();

  let toast = { id, message };
  toasts = [{ ...toast, show: true }, ...toasts].slice(0, TOAST_LIMIT);

  timeouts.forEach(clearTimeout);
  listeners.forEach((listener) => {
    listener(toasts);

    const timeout = setTimeout(() => {
      if (timeouts.size === 0) {
        toasts = [{ ...toast, show: false }, ...toasts].slice(0, TOAST_LIMIT);
        listener(toasts);
        return;
      }

      const maxTimeoutId = [...timeouts.entries()]?.reduce((a, b) => (b[1] > a[1] ? b : a))[0];

      if (maxTimeoutId === id) {
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
