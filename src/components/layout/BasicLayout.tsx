import React from 'react'
import BackButton from './BackButton'

interface Props {
  children: React.ReactNode
  title?: string
  hasBackButton?: boolean
}

const BasicLayout = ({ children, title, hasBackButton }: Props) => {
  return (
    <div className="max-w-[480px] mx-auto bg-white h-full">
      <header className="h-14 relative flex items-center justify-center bg-white text-black">
        {hasBackButton && <div className="absolute left-0">{<BackButton />}</div>}
        {title && <h1 className="text-base font-semibold text-black">{title}</h1>}
      </header>
      <div>{children}</div>
    </div>
  )
}

export default BasicLayout
