import { PropsWithChildren } from 'react'
import { RecoilRoot } from 'recoil'

const RecoilSetting = ({ children }: PropsWithChildren<unknown>) => (
  <RecoilRoot>{children}</RecoilRoot>
)

export default RecoilSetting
