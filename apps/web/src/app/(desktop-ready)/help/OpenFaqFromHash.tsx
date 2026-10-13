'use client';

import { useEffect } from 'react';

/**
 * `/help#evidence` 처럼 질문 id 로 들어오면 그 질문을 펼친다. 질문은 접힌 <details> 라 해시로 스크롤만 하면
 * 제목만 보이고 답이 닫혀 있다(상세 「지름알림이 가격을 판단하는 법」 링크가 이 경로로 온다).
 */
export default function OpenFaqFromHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: 'start' });
      }
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  return null;
}
