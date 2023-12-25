import { useEffect, useState } from 'react'

export const useDevice = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent
    const isMobileDevice = Boolean(
      userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
    )
    setIsMobile(isMobileDevice)
  }, [])

  return { isMobile }
}
