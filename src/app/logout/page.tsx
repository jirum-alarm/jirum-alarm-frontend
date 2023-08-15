'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { StorageTokenKey } from '../../type/enum/auth'

export default function Logout() {
  const router = useRouter()

  useEffect(() => {
    localStorage.removeItem(StorageTokenKey.ACCESS_TOKEN)
    localStorage.removeItem(StorageTokenKey.REFRESH_TOKEN)
    localStorage.removeItem('me')

    router.push('/')
    return
  }, [])

  return <></>
}
