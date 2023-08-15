'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { QueryMe } from '../graphql/auth'
import { userState } from '../state/user'
import { User } from '../type/user'

export default function LoadState() {
  const setUser = useSetRecoilState(userState)

  const { data } = useSuspenseQuery<{ me: User }>(QueryMe)

  useEffect(() => {
    if (data) {
      setUser(data.me)
    }
  }, [])

  return <></>
}
