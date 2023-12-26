'use client'
import { PropsWithChildren } from 'react'
import { ApolloSetting } from './apollo'
import RecoilSetting from './recoil'
import initMocks from '@/mocks'

const AppProvider = ({ children }: PropsWithChildren) => {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enable') {
    initMocks()
  }

  return (
    <RecoilSetting>
      <ApolloSetting>{children}</ApolloSetting>
    </RecoilSetting>
  )
}

export default AppProvider
