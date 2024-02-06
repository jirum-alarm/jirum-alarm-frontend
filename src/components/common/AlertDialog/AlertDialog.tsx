import { cn } from '@/lib/cn';
import { createPortal } from 'react-dom';
import { AlertDialogContext, useAlertDialogContext } from './context/AlertDialogContext';
import React, { useEffect, useId, useState } from 'react';
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
  const { children, defaultOpen = false, onOpenChange } = props;

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  const alertDialogContextValue = React.useMemo(
    () => ({
      open,
      onOpenChange: (open: boolean) => setOpen(open),
      onOpenToggle: () => setOpen((prev) => !prev),
    }),
    [open],
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

  function handler(childHanlder?: (e: React.MouseEvent<HTMLButtonElement>) => void) {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      childHanlder?.(e);
      others.onClick?.(e);
    };
  }

  const Compo = React.cloneElement(children, {
    ...{ ...others, ...children?.props },
    type: 'button',
    ref: ref,
    onClick: composeEventHandlers(handler(children?.props?.onClick), onOpenToggle),
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
              'fixed left-1/2 top-1/2 z-50 grid w-full max-w-[335px] -translate-x-1/2 -translate-y-1/2 gap-8 rounded-lg border bg-white px-4 py-5 shadow-lg',
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
const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...others }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-3 text-center', className)} {...others} />
  ),
);
Header.displayName = 'Header';

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTitle
 * -----------------------------------------------------------------------------------------------*/
const Title = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return <div ref={ref} {...props} />;
  },
);
Title.displayName = 'Title';
/* -------------------------------------------------------------------------------------------------
 * AlertDialogDescription
 * -----------------------------------------------------------------------------------------------*/
const Description = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return <div ref={ref} {...props} />;
  },
);
Description.displayName = 'Description';

/* -------------------------------------------------------------------------------------------------
 * AlertDialogClose
 * -----------------------------------------------------------------------------------------------*/

const Close = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>((props, ref) => {
  const { children, asChild, ...others } = props;
  const { onOpenChange } = useAlertDialogContext();

  if (!asChild)
    return (
      <button
        ref={ref}
        {...others}
        onClick={composeEventHandlers(others.onClick, () => onOpenChange(false))}
      >
        {children}
      </button>
    );
  if (!React.isValidElement(children)) return null;

  function handler(childHanlder?: (e: React.MouseEvent<HTMLButtonElement>) => void) {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      childHanlder?.(e);
      others.onClick?.(e);
    };
  }

  const Compo = React.cloneElement(children, {
    ...{ ...others, ...children?.props },
    type: 'button',
    ref: ref,
    onClick: composeEventHandlers(handler(children?.props?.onClick), () => onOpenChange(false)),
  });
  return <>{Compo}</>;
});
Close.displayName = 'Close';

/* -------------------------------------------------------------------------------------------------
 * AlertDialogFooter
 * -----------------------------------------------------------------------------------------------*/

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, ...others } = props;
    return <div ref={ref} className={cn('flex justify-end gap-2', className)} {...others} />;
  },
);
Footer.displayName = 'Footer';

/* -------------------------------------------------------------------------------------------------
 * AlertDialogAction
 * -----------------------------------------------------------------------------------------------*/
const Action = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>((props, ref) => {
  return <Close ref={ref} {...props} />;
});
Action.displayName = 'Action';
/* -------------------------------------------------------------------------------------------------
 * AlertDialogCancel
 * -----------------------------------------------------------------------------------------------*/
const Cancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>((props, ref) => {
  return <Close ref={ref} {...props} />;
});
Cancel.displayName = 'Cancel';

export { AlertDialog, Trigger, Content, Header, Footer, Title, Description, Action, Cancel };
