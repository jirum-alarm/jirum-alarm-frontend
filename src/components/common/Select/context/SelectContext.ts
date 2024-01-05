import React, { createContext } from 'react'

export type SelectContextProps = {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  onChange: (value: string) => void
  onClose: () => void
}

export const SelectContext = createContext<SelectContextProps | null>(null)
SelectContext.displayName = 'SelectContext'

export const useSelectContext = () => {
  const context = React.useContext(SelectContext)

  if (context === null) {
    throw new Error('useSelectContext must be used within a <Select />')
  }
  return context
}