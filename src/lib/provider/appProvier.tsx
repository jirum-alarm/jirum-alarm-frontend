'use client'
import { PropsWithChildren } from 'react'
import * as S from './layout.styled'
import StyledComponentsRegistry from './registry'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/styles/theme'
import { ApolloSetting } from './apollo'
import RecoilSetting from './recoil'

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <RecoilSetting>
      <ApolloSetting>
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>
            <S.Root id="root">
              <S.App id="app">{children}</S.App>
            </S.Root>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </ApolloSetting>
    </RecoilSetting>
  )
}

export default AppProvider
