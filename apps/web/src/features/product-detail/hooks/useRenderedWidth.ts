import { type RefObject, useLayoutEffect, useState } from 'react';

/** 요소가 실제로 그려지는 폭(px). 첫 그림 전에 한 번 읽고, 이후 크기 변화(회전·창 크기)를 따른다. */
export function useRenderedWidth(ref: RefObject<HTMLElement | null>, fallback: number) {
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const next = Math.round(el.clientWidth);
      if (next > 0) setWidth(next);
    };
    // 그리기 전에 실제 폭으로 맞춘다 — 안 그러면 640 폭(작은 글자)이 한 프레임 비친다.
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
