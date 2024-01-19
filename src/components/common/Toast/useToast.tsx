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

  listeners.forEach((listener) => {
    listener(toasts);

    timeouts.forEach((t) => clearTimeout(t));

    const timeout = setTimeout(() => {
      toasts = [{ ...toast, show: false }, ...toasts].slice(0, TOAST_LIMIT);
      listener(toasts);
      timeouts.clear();
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
  }, [state]);

  return {
    toast,
    toasts: state,
  };
};
