import React, { useEffect, useRef } from 'react';

const composeRef = <T extends HTMLDivElement>(
  forwardRef: React.ForwardedRef<T>,
  focusTrapRef: React.RefObject<T>,
  childRef?: React.RefObject<T>,
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
  /**
   * escape key down시 실행되는 함수
   * 모달 같은 곳에서 사용시에 FocusTrap컴포넌트를 트리거한 요소로 포커스를 이동시키고
   * FocusTrap컴포넌트를 unmount시켜야 합니다.
   */
  onEscapeFocusTrap: () => void;
}

const FocusTrap = React.forwardRef<HTMLDivElement, FocusTrapProps>((props, forwardedRef) => {
  const { children, onEscapeFocusTrap, ...others } = props;
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const currentFocusIndex = useRef(-1);
  const focusableElements = useRef<(HTMLElement | null)[]>([]);
  const child = React.Children.only(children);

  focusableElements.current = getFocusableElements(focusTrapRef.current);
  const firstElement = focusableElements.current[0];
  const lastElement = focusableElements.current.at(-1);

  const focusNextElement = () => {
    const element = focusableElements.current[currentFocusIndex.current + 1];
    if (!element) {
      currentFocusIndex.current = 0;
      firstElement?.focus();
      return;
    }
    element.focus();
    currentFocusIndex.current++;
  };

  const focusPrevElement = () => {
    const element = focusableElements.current[currentFocusIndex.current - 1];
    if (!element) {
      currentFocusIndex.current = focusableElements.current.length - 1;
      lastElement?.focus();
      return;
    }
    element.focus();
    currentFocusIndex.current--;
  };

  /**
   * tab key down event
   */
  const handleTabKeyDown = (event: KeyboardEvent) => {
    const isTabKeyDown = !event.shiftKey && event.key === 'Tab';
    if (!isTabKeyDown) return;

    event.preventDefault();
    focusNextElement();
  };

  /**
   * shift+tab key down event
   */
  const handleShiftTabKeyDown = (event: KeyboardEvent) => {
    const isShiftTabKeyDown = event.shiftKey && event.key === 'Tab';
    if (!isShiftTabKeyDown) return;

    event.preventDefault();
    focusPrevElement();
  };

  /**
   * escape key down event
   */
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onEscapeFocusTrap();
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      handleTabKeyDown(event);
      handleShiftTabKeyDown(event);
      handleEscapeKeyDown(event);
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [firstElement, lastElement, onEscapeFocusTrap]);

  const Compo = React.cloneElement(children, {
    ...{
      ...Object.assign({}, others, children?.props, {
        tabIndex: -1,
        ref: composeRef(forwardedRef, focusTrapRef as any, (child as any).ref),
      }),
    },
  });

  return <>{Compo}</>;
});
FocusTrap.displayName = 'FocusTrap';

export default FocusTrap;
