'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ProductService } from '@/shared/api/product';

import { rememberCardClick } from '@/entities/product-list/model/card-click-origin';

/** 카드 상세링크에 productCardTracking() 이 박는 속성(GTM 클릭 추적과 같은 것). */
const CARD_SELECTOR = '[data-track="product-card"]';
/** 자기 tracker(useProductCardTracker)로 노출을 따로 남기는 목록 — 여기서 또 세면 두 번이 된다. */
const SELF_TRACKED_SOURCES = new Set(['ranking_tab', 'expired_latest']);
const FLUSH_DEBOUNCE_MS = 1000;
const MAX_BATCH = 100; // recordProductImpressions 의 ArrayMaxSize

type Card = { source: string; productId: number; position: number };

/**
 * 카드의 출처·상품·위치(0-based) — 노출과 클릭이 같은 값을 낸다.
 * 순위가 붙은 카드(data-rank)는 순위로: 홈 랭킹 슬라이더는 무한 루프라 문서 순서가 9·10·1·2… 로 돈다.
 * 나머지는 같은 출처 카드 중 문서 순서.
 */
const readCard = (el: Element): Card | null => {
  const source = el.getAttribute('data-source');
  const productId = Number(el.getAttribute('data-product-id'));
  if (!source || !Number.isInteger(productId) || productId <= 0) return null;
  const rank = Number(el.getAttribute('data-rank'));
  if (Number.isInteger(rank) && rank > 0) return { source, productId, position: rank - 1 };
  const sameSource = document.querySelectorAll(`${CARD_SELECTOR}[data-source="${source}"]`);
  return { source, productId, position: Math.max(Array.prototype.indexOf.call(sameSource, el), 0) };
};

/**
 * 웹 상품 카드의 화면 노출(50% 이상 보임)과 클릭 출처를 한 곳에서 남긴다.
 *
 * ★왜(2026-10-12): 웹은 랭킹 탭·종료 딜 블록만 노출을 남겨서 홈·검색·추천 목록의 CTR 을 잴 수 없었다.
 * 목록 컴포넌트마다 tracker 를 다는 대신, 이미 모든 카드에 붙어 있는 data-* 속성을 문서 단위로 지켜본다.
 * 경로가 바뀌면 새 화면이므로 같은 카드도 다시 센다. 봇 요청은 서버가 버린다(isBotUserAgent).
 */
export const ProductCardTracker = () => {
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
          void ProductService.recordProductImpressions({
            source,
            impressions: impressions.slice(i, i + MAX_BATCH),
          }).catch(() => {});
        }
      }
      pending.clear();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          const card = readCard(entry.target);
          if (!card || SELF_TRACKED_SOURCES.has(card.source)) continue;
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
    // 무한 스크롤·탭 전환으로 뒤늦게 붙는 카드.
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

    // 캡처 단계 — 카드 Link 가 화면을 넘기기 전에 출처를 적는다. 상세의 CollectProductOnView 가 꺼내 쓴다.
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target.closest(CARD_SELECTOR) : null;
      const card = el ? readCard(el) : null;
      if (card && !SELF_TRACKED_SOURCES.has(card.source)) rememberCardClick(card);
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
};
