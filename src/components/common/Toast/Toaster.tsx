'use client';

import { useToast } from './useToast';
import { createContext } from 'vm';
import { Toast } from './Toast';

export const ToastContext = createContext();

const Toaster = () => {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map((toast) => {
        return (
          <Toast key={toast.id} show={toast.show}>
            {toast.message}
          </Toast>
        );
      })}
    </>
  );
};

export default Toaster;
