'use client'

import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { QueryMe } from '../graphql/auth'
import { useApiQuery } from '../hook/useGql'
import { userState } from '../state/user'
import { User } from '../type/user'

export default function LoadState() {
  const setUser = useSetRecoilState(userState)

  const { data } = useApiQuery<{ me: User }>(QueryMe)

  useEffect(() => {
    if (data) {
      console.log(data.me)
      setUser(data.me)
      localStorage.setItem('me', JSON.stringify(data.me))
    }
  }, [])

  return <></>
}
