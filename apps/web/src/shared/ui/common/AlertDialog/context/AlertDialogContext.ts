import { createContext, useContext } from 'react';

type AlertDialogContextValue = {
  open: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onOpenChange: (open: boolean) => void;
  onOpenToggle: () => void;
  /** 대화상자의 이름·설명 — Content 의 aria-labelledby·describedby 가 Title·Description 을 가리킨다. */
  titleId: string;
  descriptionId: string;
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
