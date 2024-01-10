import React from 'react'
import BackButton from './BackButton'
import { cn } from '@/lib/cn'

interface Props {
  children: React.ReactNode
  title?: string
  hasBackButton?: boolean
  noScroll?: boolean
}

const BasicLayout = ({ children, title, hasBackButton, noScroll }: Props) => {
  const headerHeight = '56px'
  const layoutHeight = noScroll ? `min-h-[calc(100vh-${headerHeight})]` : 'min-h-screen'

  return (
    <div className={cn('relative grid max-w-[480px] mx-auto bg-white', layoutHeight)}>
      <header
        // height 변경 시 레이아웃 계산식에 사용하는 변수값도 변경
        className={
          'h-14 fixed top-0 z-50 max-w-[480px] w-full flex items-center justify-center bg-white text-black'
        }
      >
        {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
        {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
      </header>
      <div className="pt-14 h-full">{children}</div>
    </div>
  )
}

export default BasicLayout
