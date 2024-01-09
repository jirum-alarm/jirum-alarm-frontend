'use client'
import { useToast } from '../common/Toast'

const ToastArea = () => {
  const { ToastContainer } = useToast()
  return <ToastContainer />
}

export default ToastArea
