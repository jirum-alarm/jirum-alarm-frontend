import { useRecoilValue, useSetRecoilState } from 'recoil'
import { toastAtom } from '@/state/toast'
import { Toast } from './Toast'
import { useCallback } from 'react'

interface Options {
  duration: number
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
 * @param {string} id - unique key
 *
 * @param {Options} options - toast options
 * @default 1500
 * @param {number} options.duration - time that remain toast
 * */
export const useToast = (id: string, options: Options = { duration: 1500 }) => {
  const { duration } = options

  const setToast = useSetRecoilState(toastAtom(id))

  const showToast = (message: string) => {
    setToast({ show: true, message })

    setTimeout(() => {
      setToast({ show: false, message: '' })
    }, duration)
  }

  const toastContainer = useCallback(() => <ToastContainer id={id} />, [id])

  return {
    ToastContainer: toastContainer,
    showToast,
  }
}

export const ToastContainer = ({ id }: { id: string }) => {
  const toast = useRecoilValue(toastAtom(id))

  return <Toast show={toast.show}>{toast.message}</Toast>
}
