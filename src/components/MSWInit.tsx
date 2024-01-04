'use client'

import { IS_API_MOCKING } from '@/constants/env'

const MSWInit = () => {
  if (IS_API_MOCKING && typeof window !== 'undefined') {
    ;(async () => {
      const { worker } = await import('../mocks/browser')
      worker.start()
    })()
  }
  return null
}

export default MSWInit
