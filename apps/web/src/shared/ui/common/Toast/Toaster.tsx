'use client';

import { Toast } from './Toast';
import { useToast } from './useToast';

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
