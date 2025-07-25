import * as React from 'react';
import * as ReactDOM from 'react-dom';

type Machine<S> = { [k: string]: { [k: string]: S } };
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

// 🤯 https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
  ? R
  : never;

function useStateMachine<M>(initialState: MachineState<M>, machine: M & Machine<MachineState<M>>) {
  return React.useReducer((state: MachineState<M>, event: MachineEvent<M>): MachineState<M> => {
    const nextState = (machine[state] as any)[event];
    return nextState ?? state;
  }, initialState);
}

interface PresenceProps {
  children: React.ReactElement;
  present: boolean;
}

const Presence: React.FC<PresenceProps> = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = React.Children.only(children);
  const composeRef = (node: HTMLElement) => {
    presence.ref(node);
    if ((child as any).ref) {
      (child as any).ref.current = node;
    }
  };
  return presence.isPresent
    ? React.cloneElement(child, Object.assign({}, { ref: composeRef }))
    : null;
};

Presence.displayName = 'Presence';

/* -------------------------------------------------------------------------------------------------
 * usePresence
 * -----------------------------------------------------------------------------------------------*/
function usePresence(present: boolean) {
  const [node, setNode] = React.useState<HTMLElement>();
  const stylesRef = React.useRef<CSSStyleDeclaration>({} as any);
  const prevAnimationNameRef = React.useRef<string>('none');
  const initialState = present ? 'mounted' : 'unmounted';

  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: 'unmounted',
      ANIMATION_OUT: 'unmountSuspended',
    },
    unmountSuspended: {
      MOUNT: 'mounted',
      ANIMATION_END: 'unmounted',
    },
    unmounted: {
      MOUNT: 'mounted',
    },
  });

  React.useLayoutEffect(() => {
    const styles = stylesRef.current;
    const prevAnimationName = prevAnimationNameRef.current;
    const currentAnimationName = getAnimationName(styles);

    if (present) {
      send('MOUNT');
      // 애니메이션이 없을 경우
    } else if (currentAnimationName === 'none' || styles?.display === 'none') {
      send('UNMOUNT');
    } else {
      const isAnimating = prevAnimationName !== currentAnimationName;

      if (isAnimating) {
        send('ANIMATION_OUT');
      } else {
        send('UNMOUNT');
      }
    }
  }, [present, send]);

  const handleAnimationStart = React.useCallback(
    (event: AnimationEvent) => {
      if (event.target === node) {
        prevAnimationNameRef.current = getAnimationName(stylesRef.current);
      }
    },
    [node],
  );

  const handleAnimationEnd = React.useCallback(
    (event: AnimationEvent) => {
      const currentAnimationName = getAnimationName(stylesRef.current);
      const isCurrentAnimation = currentAnimationName.includes(event.animationName);
      if (event.target === node && isCurrentAnimation) {
        ReactDOM.flushSync(() => send('ANIMATION_END'));
      }
    },
    [node, send],
  );

  React.useLayoutEffect(() => {
    if (!node) return;
    node.addEventListener('animationstart', handleAnimationStart);
    node.addEventListener('animationcancel', handleAnimationEnd);
    node.addEventListener('animationend', handleAnimationEnd);
    return () => {
      node.removeEventListener('animationstart', handleAnimationStart);
      node.removeEventListener('animationcancel', handleAnimationEnd);
      node.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [handleAnimationEnd, handleAnimationStart, node, send]);

  return {
    isPresent: ['mounted', 'unmountSuspended'].includes(state),
    ref: React.useCallback((node: HTMLElement) => {
      if (node) stylesRef.current = getComputedStyle(node);
      setNode(node);
    }, []),
  };
}

/* -----------------------------------------------------------------------------------------------*/

function getAnimationName(styles?: CSSStyleDeclaration) {
  return styles?.animationName || 'none';
}

export { Presence };
export type { PresenceProps };
