import styled from 'styled-components'

export const PolicyWrapper = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 44px;
`
export const PolicyHeader = styled.div`
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  position: fixed;
  top: 0px;
  background-color: white;
  > h1 {
    ${({ theme }) => theme.fonts.s_Bold_16}
  }
`
export const PolicyBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 20px;
  width: 100%;
`
export const CloseBtn = styled.button`
  position: absolute;
  right: 18px;
`
export const PolicyIndex = styled.section`
  ${({ theme }) => theme.fonts.Regular_14};
  color: ${({ theme }) => theme.colors.gray_600};
  > ol {
    width: fit-content;
  }
  > ol > a {
    cursor: pointer;
    width: fit-content;
  }
`
export const PolicyContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
`
export const PolicyContentItem = styled.div`
  color: ${({ theme }) => theme.colors.gray_900};
  > h2 {
    margin-bottom: 12px;
    ${({ theme }) => theme.fonts.s_Bold_16}
  }
  > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  > p {
    ${({ theme }) => theme.fonts.Regular_14}
  }
`
export const PolicyDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  ${({ theme }) => theme.fonts.Regular_13}
  color: ${({ theme }) => theme.colors.gray_500}
`
