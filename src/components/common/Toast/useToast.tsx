import { Toast } from './Toast';
import { useState } from 'react';

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

let update: (toasts: Toast[]) => void;
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

const toast = (message: string) => {
  const id = genId();

  toasts = [...toasts, { id, message, show: true }];
  update(toasts);

  const timeout = setTimeout(() => {
    toasts = toasts.map((toast) => {
      return toast.id === id ? { ...toast, show: false } : toast;
    });
    update(toasts);

    const maxTimeoutId =
      !!timeouts.size && [...timeouts.entries()]?.reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    if (maxTimeoutId === id) {
      toasts = [];
      timeouts.clear();
    }
  }, TOAST_REMOVE_DELAY);

  timeouts.set(id, timeout);
};

export const useToast = () => {
  const [state, setState] = useState(toasts);

  update = setState;

  return {
    toast,
    toasts: state,
  };
};
