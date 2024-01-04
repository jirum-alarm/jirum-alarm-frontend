'use client'
import { PropsWithChildren } from 'react'
import { ApolloSetting } from './apollo'
import RecoilSetting from './recoil'
import initMocks from '@/mocks'

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilSetting>
      <ApolloSetting>{children}</ApolloSetting>
    </RecoilSetting>
  )
}

export default AppProvider
