import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { AlertDialogContext, useAlertDialogContext } from './context/AlertDialogContext';

import FocusTrap from '@/components/headless/FocusTrap';
import { Presence } from '@/components/headless/Presence';
import ScrollLock from '@/components/headless/ScrollLock';
import { cn } from '@/lib/cn';
import { composeEventHandlers } from '@/util/event';

const getState = (open: boolean) => {
  return open ? 'open' : 'closed';
};

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  const alertDialogContextValue = React.useMemo(
    () => ({
      open,
      triggerRef,
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
>((props, forwardRef) => {
  const { children, asChild, ...others } = props;
  const { onOpenToggle, open, triggerRef } = useAlertDialogContext();

  const composeRef = (
    triggerRef: React.RefObject<HTMLButtonElement>,
    forwardRef?: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    return (node: HTMLButtonElement) => {
      if (typeof forwardRef === 'function') {
        forwardRef(node);
      } else if (forwardRef) {
        forwardRef.current = node;
      }
      (triggerRef as React.MutableRefObject<HTMLButtonElement>).current = node;
    };
  };

  if (!asChild)
    return (
      <button
        ref={composeRef(triggerRef, forwardRef)}
        {...others}
        data-state={getState(open)}
        onClick={composeEventHandlers(others.onClick, onOpenToggle)}
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
    'data-state': getState(open),
    ref: composeRef(triggerRef, forwardRef),
    onClick: composeEventHandlers(handler(children?.props?.onClick), onOpenToggle),
  });
  return <>{Compo}</>;
});
Trigger.displayName = 'Trigger';
/* -------------------------------------------------------------------------------------------------
 * AlertDialogOverlay
 * -----------------------------------------------------------------------------------------------*/
const Overlay = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { open } = useAlertDialogContext();
  return (
    <Presence present={open}>
      <OverlayImpl {...props} />
    </Presence>
  );
};

const OverlayImpl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props: React.HTMLAttributes<HTMLDivElement>, ref) => {
    const { className, onClick, ...others } = props;
    const { onOpenChange, open } = useAlertDialogContext();
    return (
      <ScrollLock>
        <div
          ref={ref}
          data-state={getState(open)}
          className={cn(
            'fixed inset-0 z-50 bg-black/80',
            'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
            className,
          )}
          onClick={composeEventHandlers(onClick, () => onOpenChange(false))}
          {...others}
        />
      </ScrollLock>
    );
  },
);
OverlayImpl.displayName = 'OverlayImpl';

const ContentImpl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, ...others } = props;
    const { open, onOpenChange, triggerRef } = useAlertDialogContext();
    return (
      <Presence present={open}>
        <FocusTrap
          onEscapeFocusTrap={() => {
            onOpenChange(false);
            triggerRef.current?.focus();
          }}
        >
          <div
            ref={ref}
            data-state={getState(open)}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 grid w-full max-w-[335px] -translate-x-1/2 -translate-y-1/2 gap-8 rounded-lg border bg-white px-4 py-5 shadow-lg',
              'data-[state=closed]:animate-modal-zoom-out data-[state=open]:animate-modal-zoom-in',
              className,
            )}
            {...others}
          />
        </FocusTrap>
      </Presence>
    );
  },
);

ContentImpl.displayName = 'ContentImpl';

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/
const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return (
      <Portal>
        <Overlay />
        <ContentImpl {...props} ref={ref} />
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
