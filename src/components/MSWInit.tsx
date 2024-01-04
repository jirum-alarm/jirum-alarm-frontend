'use client'
const MSWInit = () => {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enable' && typeof window !== 'undefined') {
    ;(async () => {
      const { worker } = await import('../mocks/browser')
      worker.start()
    })()
  }
  return null
}

export default MSWInit
