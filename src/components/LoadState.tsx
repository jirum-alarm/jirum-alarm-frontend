'use client'

import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { QueryMe } from '../graphql/auth'
import { useApiQuery } from '../hooks/useGql'
import { userState } from '../state/user'
import { User } from '../types/user'

export default function LoadState() {
  const setUser = useSetRecoilState(userState)

  const { data } = useApiQuery<{ me: User }>(QueryMe)

  useEffect(() => {
    if (data) {
      setUser(data.me)
      localStorage.setItem('me', JSON.stringify(data.me))
    }
  }, [])

  return <></>
}
