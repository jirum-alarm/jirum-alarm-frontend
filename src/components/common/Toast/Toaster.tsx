'use client';

import { useToast } from './useToast';
import { Toast } from './Toast';

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
