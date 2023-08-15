'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PiBellSimpleBold } from 'react-icons/pi'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { QueryMe } from '../graphql/auth'
import { useApiQuery } from '../hook/useGql'
import { userState } from '../state/user'
import { User } from '../type/user'
import LoadState from './LoadState'

export default function NavBar() {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  const setUser = useSetRecoilState(userState)

  const { data } = useApiQuery<{ me: User }>(QueryMe)

  if (data) {
    setUser(data.me)
    localStorage.setItem('me', JSON.stringify(data.me))
  }

  const user = useRecoilValue<User | null>(userState)

  return (
    <>
      <LoadState></LoadState>
      <div className="pt-8 px-4">
        <div className="flex items-center justify-between">
          <div className="w-3/12"></div>
          <Link href="/">
            <h1 className="text-center flex center text-3xl">
              지름알림
              <PiBellSimpleBold className="w-8 h-8 text-yellow-500" />
            </h1>
          </Link>

          <div className="w-3/12 flex justify-end">
            {user ? (
              <>
                <span className="font-semibold">반갑습니다.</span>
              </>
            ) : (
              !isLoginPage && (
                <Link href="/login">
                  <span className="font-semibold">로그인</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}
