import { useCallback, useRef } from 'react';

type ElementOffset = {
  offsetLeft: number;
  offsetWidth: number;
};

const useMoveListCenter = () => {
  const listRef = useRef<HTMLDivElement>(null);
  // const listRef = useRef<HTMLUListElement>(null);

  function _moveListCenter({ offsetLeft, offsetWidth }: ElementOffset): void {
    if (!listRef.current) return;
    const halfWidth = listRef.current?.offsetWidth / 2;
    const offset = offsetLeft + offsetWidth / 2 - halfWidth;
    listRef.current?.scrollTo({
      left: offset,
      behavior: 'smooth',
    });
    return;
  }

  const moveListCenter = useCallback(_moveListCenter, []);

  return { listRef, moveListCenter };
};

export default useMoveListCenter;
