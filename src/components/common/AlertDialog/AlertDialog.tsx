import { cn } from '@/lib/cn';
import { createPortal } from 'react-dom';
import { AlertDialogContext, useAlertDialogContext } from './context/AlertDialogContext';
import React, { useId, useState } from 'react';
import { composeEventHandlers } from '@/util/event';

interface DialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
/* -------------------------------------------------------------------------------------------------
 * AlertDialog
 * -----------------------------------------------------------------------------------------------*/
const AlertDialog = (props: DialogProps) => {
  const { children, defaultOpen = false, onOpenChange = () => {} } = props;

  const [open, setOpen] = useState(defaultOpen);

  const alertDialogContextValue = React.useMemo(
    () => ({
      open,
      onOpenChange,
      onOpenToggle: () => setOpen((prev) => !prev),
    }),
    [onOpenChange, open],
  );
  return (
    <AlertDialogContext.Provider value={alertDialogContextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogPortal
 * -----------------------------------------------------------------------------------------------*/

interface PortalProps {}
const Portal = () => {
  return <div>sdf</div>;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTrigger
 * -----------------------------------------------------------------------------------------------*/
const Trigger = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  const { children, asChild, ...others } = props;
  const { onOpenToggle } = useAlertDialogContext();
  if (!asChild)
    return (
      <button {...others} onClick={composeEventHandlers(others.onClick, onOpenToggle)}>
        {children}
      </button>
    );
  if (!React.isValidElement(children)) return null;

  const Compo = React.cloneElement(children, {
    ...children?.props,
    type: 'button',
    onClick: composeEventHandlers(others.onClick, onOpenToggle),
  });
  return <>{Compo}</>;
};
/* -------------------------------------------------------------------------------------------------
 * AlertDialogOverlay
 * -----------------------------------------------------------------------------------------------*/
const Overlay = () => {
  return <div>Overlay</div>;
};
/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/
const Content = ({ children }: any) => {
  const { open } = useAlertDialogContext();
  console.log('open:', open);
  return <div>{children}</div>;
};
/* -------------------------------------------------------------------------------------------------
 * AlertDialogHeader
 * -----------------------------------------------------------------------------------------------*/
const Header = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
/* -------------------------------------------------------------------------------------------------
 * AlertDialogFooter
 * -----------------------------------------------------------------------------------------------*/
const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
Footer.displayName = 'Footer';
/* -------------------------------------------------------------------------------------------------
 * AlertDialogTitle
 * -----------------------------------------------------------------------------------------------*/
const Title = ({ children }: any) => {
  return <div>{children}</div>;
};
/* -------------------------------------------------------------------------------------------------
 * AlertDialogDescription
 * -----------------------------------------------------------------------------------------------*/
const Description = ({ children }: any) => {
  return <div>{children}</div>;
};
/* -------------------------------------------------------------------------------------------------
 * AlertDialogAction
 * -----------------------------------------------------------------------------------------------*/
const Action = ({ children }: any) => {
  return <div>{children}</div>;
};
/* -------------------------------------------------------------------------------------------------
 * AlertDialogCancel
 * -----------------------------------------------------------------------------------------------*/
const Cancel = ({ children }: any) => {
  return <div>{children}</div>;
};

export {
  AlertDialog,
  Portal,
  Trigger,
  Overlay,
  Content,
  Header,
  Footer,
  Title,
  Description,
  Action,
  Cancel,
};
