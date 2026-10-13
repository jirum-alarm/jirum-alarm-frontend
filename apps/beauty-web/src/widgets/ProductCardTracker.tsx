'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { recordProductImpressions } from '@/shared/api/client';
import { CARD_SELECTOR, readTrackedCard, rememberCardClick } from '@/shared/lib/card-tracking';

const FLUSH_DEBOUNCE_MS = 1000;
const MAX_BATCH = 100; // recordProductImpressions 의 ArrayMaxSize

/**
 * 카드 노출(50% 이상 보임)과 클릭 출처를 문서 단위로 남긴다 — web app/(app)/providers/productCardTracker.tsx 를
 * 옮긴 것(위치는 data-position 을 그대로 쓴다). 무한 스크롤로 뒤늦게 붙는 카드는 MutationObserver 가 잡는다.
 * 경로가 바뀌면 새 화면이므로 같은 카드도 다시 센다. 봇 요청은 서버가 버린다.
 */
export default function ProductCardTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const seen = new Set<string>();
    const pending = new Map<string, { productId: number; position: number }[]>();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      for (const [source, impressions] of pending) {
        for (let i = 0; i < impressions.length; i += MAX_BATCH) {
          recordProductImpressions(source, impressions.slice(i, i + MAX_BATCH));
        }
      }
      pending.clear();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          const card = readTrackedCard(entry.target);
          if (!card) continue;
          const key = `${card.source}:${card.productId}:${card.position}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const list = pending.get(card.source) ?? [];
          list.push({ productId: card.productId, position: card.position });
          pending.set(card.source, list);
        }
        if (pending.size === 0) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(flush, FLUSH_DEBOUNCE_MS);
      },
      { threshold: 0.5 },
    );

    const observeWithin = (root: ParentNode) =>
      root.querySelectorAll(CARD_SELECTOR).forEach((el) => io.observe(el));
    observeWithin(document);
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(CARD_SELECTOR)) io.observe(node);
          observeWithin(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 캡처 단계 — 링크가 화면을 넘기기 전에 출처를 적는다. web 상세가 꺼내 post_view 에 싣는다.
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target.closest(CARD_SELECTOR) : null;
      const card = el ? readTrackedCard(el) : null;
      if (card) rememberCardClick(card);
    };
    document.addEventListener('click', onClick, true);

    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      flush();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [pathname]);

  return null;
}
