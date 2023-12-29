'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PiBellSimpleBold } from 'react-icons/pi'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { Logo } from '@/components/common/icons'
import { QueryMe } from '../graphql/auth'
import { useLazyApiQuery } from '../hooks/useGql'
import { userState } from '../state/user'
import { StorageTokenKey } from '../types/enum/auth'
import { User } from '../types/user'
import LoadState from './LoadState'
import Select from './common/Select'

export default function NavBar() {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  const setUser = useSetRecoilState(userState)

  const user = useRecoilValue<User | null>(userState)

  const { getQuery } = useLazyApiQuery<{ me: User }>(QueryMe)

  useEffect(() => {
    const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN)
    if (token) {
      getQuery().then((response) => {
        if (response.data) {
          setUser(response.data?.me)
          localStorage.setItem('me', JSON.stringify(response.data.me))
        }
      })
    }
  }, [])

  const [value, setValue] = useState('0')

  const changeTitle = (value: string) => {
    setValue(value)
  }

  return (
    <>
      <LoadState></LoadState>
      <div className="pt-8 px-4">
        
        <div className="flex items-center justify-between">
          <div className="w-3/12" />
          <Link href="/">
            <div className="grid grid-flow-col gap-x-3 items-center">
              <Logo />
              <h1 className="text-center flex center text-3xl">지름알림</h1>
            </div>
          </Link>

          <div className="w-3/12 flex justify-end">
            {/* {user ? (
              <>
                <Link href="/logout">
                  <span className="font-semibold">로그아웃</span>
                </Link>
              </>
            ) : (
              !isLoginPage && (
                <Link href="/login">
                  <span className="font-semibold">로그인</span>
                </Link>
              )
            )} */}
          </div>
        </div>
      </div>
    </>
  )
}
