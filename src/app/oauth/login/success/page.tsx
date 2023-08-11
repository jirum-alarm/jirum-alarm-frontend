'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { QueryMe } from '../../../../graphql/auth'
import { userState } from '../../../../state/user'
import { StorageTokenKey } from '../../../../type/enum/auth'
import { User } from '../../../../type/user'

export default function OauthLoginSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setUser = useSetRecoilState(userState)

  const accessToken = searchParams.get('accessToken')
  const refreshToken = searchParams.get('refreshToken')

  const { data } = useSuspenseQuery<{ me: User }>(QueryMe)

  if (accessToken) {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, accessToken)
  }

  if (refreshToken) {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, refreshToken)
  }

  useEffect(() => {
    if (data) {
      setUser(data.me)
    }

    router.push('/')
    return
  }, [])
}
