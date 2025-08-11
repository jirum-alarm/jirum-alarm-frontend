import { createContext, useContext } from 'react';

type SelectContextProps = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onChange: (value?: string | null) => void;
  onClose: () => void;
  selectedOffsetTop: number;
  setSelectedOffsetTop: (top: number) => void;
};

export const SelectContext = createContext<SelectContextProps | null>(null);
SelectContext.displayName = 'SelectContext';

export const useSelectContext = () => {
  const context = useContext(SelectContext);

  if (context === null) {
    throw new Error('useSelectContext must be used within a <Select />');
  }
  return context;
};
