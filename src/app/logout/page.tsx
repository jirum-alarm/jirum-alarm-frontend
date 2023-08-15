'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { userState } from '../../state/user'
import { StorageTokenKey } from '../../type/enum/auth'

export default function Logout() {
  const router = useRouter()
  const setUser = useSetRecoilState(userState)

  useEffect(() => {
    localStorage.removeItem(StorageTokenKey.ACCESS_TOKEN)
    localStorage.removeItem(StorageTokenKey.REFRESH_TOKEN)
    localStorage.removeItem('me')
    setUser(null)

    router.push('/')
    return
  }, [])

  return <></>
}
