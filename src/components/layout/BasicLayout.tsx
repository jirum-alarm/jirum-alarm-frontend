import React from 'react'
import BackButton from './BackButton'

interface Props {
  children: React.ReactNode
  title?: string
  hasBackButton?: boolean
}

const BasicLayout = ({ children, title, hasBackButton }: Props) => {
  return (
    <div className="h-full max-w-[480px] mx-auto bg-white flex flex-col">
      <header className="h-14 shrink-0 w-full sticky top-0 flex items-center justify-center bg-white text-black">
        {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
        {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default BasicLayout
