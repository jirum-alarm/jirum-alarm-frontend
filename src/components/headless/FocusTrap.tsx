import React, { useEffect, useRef } from 'react';

const composeRef = <T extends HTMLDivElement>(
  forwardRef: React.ForwardedRef<T>,
  focusTrapRef: React.MutableRefObject<T>,
  childRef?: React.MutableRefObject<T>,
) => {
  return (node: T) => {
    if (!forwardRef) return;
    if (typeof forwardRef === 'function') {
      forwardRef(node);
    } else {
      forwardRef.current = node;
    }
    focusTrapRef.current = node;
    if (!childRef) return;
    childRef.current = node;
  };
};

const getFocusableElements = (
  element: HTMLElement | ChildNode | null,
  result: HTMLElement[] = [],
) => {
  if (!element || !element.childNodes) return result;

  for (const childNode of element.childNodes) {
    const childElement = childNode as HTMLElement;
    if (childElement.tabIndex >= 0) {
      result.push(childElement);
    }
    getFocusableElements(childElement, result);
  }

  return result;
};

interface FocusTrapProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  onEscapeFocusTrap: () => void;
}

const FocusTrap = React.forwardRef<HTMLDivElement, FocusTrapProps>((props, forwardedRef) => {
  const { children, onEscapeFocusTrap, ...others } = props;
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const focusableElements = useRef<(HTMLElement | null)[]>([]);
  const child = React.Children.only(children);

  focusableElements.current = getFocusableElements(focusTrapRef.current);
  const firstElement = focusableElements.current[0];
  const lastElement = focusableElements.current.at(-1);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
      if (event.key === 'Escape') {
        onEscapeFocusTrap();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [firstElement, lastElement, onEscapeFocusTrap]);

  const Compo = React.cloneElement(children, {
    ...{ ...others, ...children?.props },
    tabIndex: -1,
    ref: composeRef(forwardedRef, focusTrapRef as any, (child as any).ref),
  });

  return <>{Compo}</>;
});
FocusTrap.displayName = 'FocusTrap';

export default FocusTrap;
