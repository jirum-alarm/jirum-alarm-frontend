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

interface PortalProps {
  container?: HTMLElement | null;
  children: React.ReactNode;
}
const Portal = (props: PortalProps) => {
  const { container = globalThis?.document?.body, children } = props;
  return container ? createPortal(children, container) : null;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTrigger
 * -----------------------------------------------------------------------------------------------*/
const Trigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>((props, ref) => {
  const { children, asChild, ...others } = props;
  const { onOpenToggle } = useAlertDialogContext();
  if (!asChild)
    return (
      <button ref={ref} {...others} onClick={composeEventHandlers(others.onClick, onOpenToggle)}>
        {children}
      </button>
    );
  if (!React.isValidElement(children)) return null;

  const Compo = React.cloneElement(children, {
    ...children?.props,
    type: 'button',
    ref: ref,
    onClick: composeEventHandlers(others.onClick, onOpenToggle),
  });
  return <>{Compo}</>;
});
Trigger.displayName = 'Trigger';
/* -------------------------------------------------------------------------------------------------
 * AlertDialogOverlay
 * -----------------------------------------------------------------------------------------------*/
const Overlay = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...others } = props;
  return <div {...others} className={cn('fixed inset-0 z-50 bg-black/40', className)} />;
};

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/
const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { children, className, ...others } = props;
    const { open } = useAlertDialogContext();
    return (
      <Portal>
        {open && <Overlay />}
        {open && (
          <div
            ref={ref}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-white p-6 shadow-lg',
              className,
            )}
            {...others}
          >
            {children}
          </div>
        )}
      </Portal>
    );
  },
);
Content.displayName = 'Content';
/* -------------------------------------------------------------------------------------------------
 * AlertDialogHeader
 * -----------------------------------------------------------------------------------------------*/
const Header = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 text-center', className)} {...props} />
);
/* -------------------------------------------------------------------------------------------------
 * AlertDialogFooter
 * -----------------------------------------------------------------------------------------------*/
const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props} />
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

export { AlertDialog, Trigger, Content, Header, Footer, Title, Description, Action, Cancel };
