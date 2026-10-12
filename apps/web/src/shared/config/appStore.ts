export const ANDROID_STORE_LINK =
  'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';

// apps/mobile scripts/verify-public-contracts.mjs 가 이 문자열(랜딩과 같은 값)을 고정한다. 버튼 링크는 캠페인(pt·ct)이
// 붙는 features/app-download/model/appHandoff.ts appStoreUrl 을 쓴다.
export const IOS_STORE_LINK =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

/** PC에 노출하는 QR의 착지 경로. UA로 스토어 버튼을 고른다 → src/app/app/page.tsx */
export const APP_QR_PATH = '/app';
