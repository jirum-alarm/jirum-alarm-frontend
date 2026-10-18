/**
 * 삼성 인터넷 하단 구매 바 모양 실험 `samsung_cta_button_v1`(2026-10-19, crawling-server experiment-registry).
 *
 * 질문: 삼성 인터넷이 하단 고정 바를 숨기는(not_rendered 17→36%) 방아쇠가 「떠 있는 요소 안의 외부 링크(<a href>)」인가.
 * rel=sponsored 는 아니었다(10/19 판독). 버튼 군은 href 없는 <button> 이 클릭 때 새 창을 연다 — 숨김 비율이 군별로 갈리면 링크가 방아쇠.
 *
 * 단위 = 상세 페이지 열기(판정 지표가 페이지당 숨김이고, 첫 방문 기기 id 를 기다리면 바가 늦게 바뀐다).
 * 삼성 인터넷만 대상. 군은 cta_geometry 끝 ` v:button|v:link` 로 남는다(GTM·GA4 변경 없이).
 * 끄려면 PERCENT 를 0 으로(웹 태그). 판정이 나면 진 쪽 코드를 지운다.
 */
export const SAMSUNG_CTA_EXPERIMENT_ID = 'samsung_cta_button_v1';
export const SAMSUNG_CTA_BUTTON_PERCENT = 50;

export type CtaVariant = 'link' | 'button';

export const isSamsungInternet = (userAgent: string) => /SamsungBrowser\//.test(userAgent);

/** 삼성 인터넷이 아니면 null(실험 밖 — 늘 링크). random 은 0~1. */
export const pickCtaVariant = (userAgent: string, random: number): CtaVariant | null => {
  if (!isSamsungInternet(userAgent)) return null;
  return random * 100 < SAMSUNG_CTA_BUTTON_PERCENT ? 'button' : 'link';
};
