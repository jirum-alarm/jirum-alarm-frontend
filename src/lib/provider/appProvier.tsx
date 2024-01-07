'use client'
import { PropsWithChildren } from 'react'
import { ApolloSetting } from './apollo'
import RecoilSetting from './recoil'

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilSetting>
      <ApolloSetting>{children}</ApolloSetting>
    </RecoilSetting>
  )
}

export default AppProvider
