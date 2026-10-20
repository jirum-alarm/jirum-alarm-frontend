// 찍은 화면에서 «눈으로 봐야 알던» 깨짐을 숫자로 잡는다. 지난 한 달 fix 커밋의 ~30% 가 겹침·안 보임·다크·넘침이었다.
// 전부 브라우저 안에서 도는 함수 — page.evaluate 로 넘긴다(바깥 변수를 참조하면 안 된다).
import type { Page } from '@playwright/test';

export type Issue = { check: string; detail: string };

const AXE_SOURCE = require.resolve('axe-core/axe.min.js');

/** 가로 스크롤이 생기는가 — 폰에서 화면이 옆으로 밀리는 가장 흔한 레이아웃 붕괴. 넘친 요소를 몇 개 짚어 준다. */
export const horizontalOverflow = (page: Page) =>
  page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= width + 1) return [];
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${[...el.classList].slice(0, 4).join('.')}`;
    const offenders: string[] = [];
    for (const el of document.body.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= width + 1) continue;
      // 가로 스크롤 영역(캐러셀·칩 줄) 안의 요소는 정상.
      let p = el.parentElement;
      let scrolls = false;
      while (p && p !== document.body) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
          scrolls = true;
          break;
        }
        p = p.parentElement;
      }
      if (!scrolls) offenders.push(`${describe(el)} right=${Math.round(rect.right)}`);
      if (offenders.length >= 5) break;
    }
    return [
      `scrollWidth ${document.documentElement.scrollWidth} > ${width}: ${offenders.join(' | ')}`,
    ];
  });

/**
 * 글자끼리 겹치는가 — 라벨·툴팁·배지가 다른 글자를 덮는 것. 글자 노드의 실제 줄 상자끼리 비교한다.
 * 숨김(visibility·opacity 0·aria-hidden)·잘림(overflow 부모 밖)은 뺀다.
 */
export const textOverlap = (page: Page) =>
  page.evaluate(() => {
    type Box = { text: string; r: DOMRect; el: Element; layer: Element | null };
    // checkVisibility 는 닫힌 <details> 안(더 보기 접힘)·content-visibility 까지 본다 — computed style 만으론 못 잡았다.
    const visible = (el: Element) => {
      if (
        !el.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
          contentVisibilityAuto: true,
        })
      ) {
        return false;
      }
      for (let p: Element | null = el; p; p = p.parentElement) {
        if (p.getAttribute('aria-hidden') === 'true' || p.hasAttribute('inert')) return false;
      }
      return true;
    };
    // 글자 상자를 잘라내는 조상(자기 포함 — truncate·line-clamp)으로 깎은 «실제로 보이는» 상자. 다 깎이면 null.
    // 안 깎으면 말줄임된 제목이 옆 칸까지 뻗은 상자로 잡혀 이웃 카드 글자와 겹쳐 보인다.
    const visibleRect = (el: Element, r: DOMRect) => {
      let { left, top, right, bottom } = r;
      for (let p: Element | null = el; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
        const pr = p.getBoundingClientRect();
        left = Math.max(left, pr.left);
        top = Math.max(top, pr.top);
        right = Math.min(right, pr.right);
        bottom = Math.max(top, Math.min(bottom, pr.bottom));
        if (right - left < 2 || bottom - top < 2) return null;
      }
      return new DOMRect(left, top, right - left, bottom - top);
    };
    // 같은 스크롤 위치에서 고정 요소(헤더·탭바)는 본문과 겹치는 게 정상 — 서로 다른 고정 층이면 비교하지 않는다.
    const layer = (el: Element) => {
      for (let p: Element | null = el; p; p = p.parentElement) {
        const pos = getComputedStyle(p).position;
        if (pos === 'fixed' || pos === 'sticky') return p;
      }
      return null;
    };
    const boxes: Box[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent?.trim();
      const el = n.parentElement;
      if (!text || !el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
      if (!visible(el)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()]
        .map((r) => (r.width >= 2 && r.height >= 2 ? visibleRect(el, r) : null))
        .filter((r): r is DOMRect => r !== null);
      const elLayer = rects.length ? layer(el) : null;
      for (const r of rects) boxes.push({ text: text.slice(0, 24), r, el, layer: elLayer });
      if (boxes.length > 2500) break;
    }
    const found: string[] = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (w <= 0 || h <= 0) continue;
        if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el) || a.layer !== b.layer)
          continue;
        const smaller = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
        if ((w * h) / smaller < 0.3) continue;
        found.push(
          `«${a.text}» × «${b.text}» @(${Math.round(a.r.left)},${Math.round(a.r.top + scrollY)})`,
        );
        if (found.length >= 8) return found;
      }
    }
    return found;
  });

/** 보이는데 읽을 수 없는 글자(대비)·이름 없는 버튼/링크/이미지. 다크에서만 깨지는 대비가 가장 흔한 회귀였다. */
export const accessibility = async (page: Page) => {
  await page.addScriptTag({ path: AXE_SOURCE });
  return page.evaluate(async () => {
    const axe = (
      window as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<AxeResult> } }
    ).axe;
    type AxeResult = {
      violations: {
        id: string;
        impact: string | null;
        nodes: { target: string[]; failureSummary?: string }[];
      }[];
    };
    const result = await axe.run(document, {
      runOnly: {
        type: 'rule',
        values: ['color-contrast', 'button-name', 'link-name', 'image-alt'],
      },
      resultTypes: ['violations'],
    });
    return result.violations.flatMap((v) =>
      v.nodes.slice(0, 6).map((n) => ({
        rule: v.id,
        target: n.target.join(' '),
        summary: (n.failureSummary ?? '').split('\n').slice(1, 2).join(' ').trim(),
      })),
    );
  });
};

/** 라우트 오류 경계가 그려졌는가(error.tsx → ServerError). */
export const errorBoundary = (page: Page) =>
  page
    .getByText('서버에러가 발생했습니다')
    .isVisible()
    .catch(() => false);
