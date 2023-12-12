import styled from 'styled-components'

export const Root = styled.div`
  position: relative;
  min-width: 320px;
  background-color: #ffffff;
`

export const App = styled.div`
  min-height: calc(100vh - env(safe-area-inset-bottom) - 56px);
  max-width: 1024px;
  margin: 0 auto;
  padding-bottom: calc(env(safe-area-inset-bottom) + 56px);
  box-sizing: border-box;
  overflow: hidden;
`
