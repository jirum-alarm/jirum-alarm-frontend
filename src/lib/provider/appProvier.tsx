'use client'
import { PropsWithChildren } from 'react'
import * as S from './layout.styled'
import StyledComponentsRegistry from './registry'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/style/theme'
import { ApolloSetting } from './apollo'
import RecoilSetting from './recoil'
import initMocks from '@/mocks'

const AppProvider = ({ children }: PropsWithChildren) => {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enable') {
    initMocks()
  }

  return (
    <RecoilSetting>
      <ApolloSetting>
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>
            <S.Root id="root">
              {children}
              {/* <S.App id="app">{children}</S.App> */}
            </S.Root>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </ApolloSetting>
    </RecoilSetting>
  )
}

export default AppProvider
