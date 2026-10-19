/** GTM dataLayer 에 바로 넣는다(서버 렌더에선 아무것도 안 함). */
export const pushDataLayer = (payload: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push(payload);
};
