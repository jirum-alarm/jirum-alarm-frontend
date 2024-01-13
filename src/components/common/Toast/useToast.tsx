import { useRecoilValue, useSetRecoilState } from 'recoil';
import { toastAtom } from '@/state/toast';
import { Toast } from './Toast';
import { useCallback, useId } from 'react';

interface Options {
  duration: number;
}

/**
 * @description
 * Pass unique key to `useToast` and add `TestContaier` component.
 * Show toast by using `showToast` with message.
 *
 * @example
 * ```tsx
 * const { ToastContainer, showToast } = useToast(useId())
 *
 * <>
 *   <Button onClick={() => showToast('저장이 완료되었습니다')}>저장</Button>
 *   <ToastContainer />
 * </>
 * ```
 *
 * @default 1500
 * @param {number} options.duration - time that remain toast
 * */
export const useToast = (options: Options = { duration: 1500 }) => {
  const { duration } = options;
  const id = useId();

  const setToast = useSetRecoilState(toastAtom(id));

  const showToast = (() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (message: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setToast({ show: false, message });
      }
      setToast({ show: true, message });

      timeoutId = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, duration);
    };
  })();

  const toastContainer = useCallback(() => <ToastContainer id={id} />, [id]);

  return {
    ToastContainer: toastContainer,
    showToast,
  };
};

export const ToastContainer = ({ id }: { id: string }) => {
  const toast = useRecoilValue(toastAtom(id));

  return <Toast show={toast.show}>{toast.message}</Toast>;
};
