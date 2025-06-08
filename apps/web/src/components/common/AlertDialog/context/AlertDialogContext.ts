import { createContext, useContext } from 'react';

export type AlertDialogContextValue = {
  open: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
};

export const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);
AlertDialogContext.displayName = 'AlertDialogContext';

export const useAlertDialogContext = () => {
  const context = useContext(AlertDialogContext);

  if (context === null) {
    throw new Error('useAlertDialogContext must be used within a <AlertDialog />');
  }
  return context;
};
