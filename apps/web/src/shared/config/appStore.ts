export const ANDROID_STORE_LINK =
  'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';

// 스토어프런트(/sg/ 등)를 박지 않는다 — 사용자 나라 스토어로 열린다. 버튼 링크는 캠페인(pt·ct)이 붙는
// features/app-download/model/appHandoff.ts appStoreUrl 을 쓴다.
export const IOS_STORE_LINK = 'https://apps.apple.com/app/apple-store/id6474611420';

/** PC에 노출하는 QR의 착지 경로. UA로 스토어 버튼을 고른다 → src/app/app/page.tsx */
export const APP_QR_PATH = '/app';
