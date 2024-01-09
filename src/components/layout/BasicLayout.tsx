import React from 'react'
import BackButton from './BackButton'

interface Props {
  children: React.ReactNode
  title?: string
  hasBackButton?: boolean
}

const BasicLayout = ({ children, title, hasBackButton }: Props) => {
  return (
    <div className="relative min-h-[calc(100vh-56px)] grid max-w-[480px] mx-auto bg-white">
      <header className="h-14 fixed top-0 z-50 max-w-[480px] w-full flex items-center justify-center bg-white text-black">
        {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
        {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
      </header>
      <div className="pt-14 h-full">{children}</div>
    </div>
  )
}

export default BasicLayout
