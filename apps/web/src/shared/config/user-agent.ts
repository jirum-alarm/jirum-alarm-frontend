/**
 * UA 판정 정규식 — 서버(app/actions/agent.ts)와 클라이언트(shared/hooks/useDevice.ts)가
 * 같은 값을 내야 하므로 여기 한 곳에 둔다. 한쪽만 고치면 하이드레이션 직후
 * 판정이 뒤집혀 그 컴포넌트가 한 프레임 다른 걸 그린다.
 */

/**
 * 카톡·인스타 등 인앱 브라우저.
 * UA 에 Safari 가 붙어 isSafari 로 잡히지만 네이티브 Smart App Banner 는
 * 뜨지 않으므로, "사파리니까 앱 배너 빼자" 판단에서 제외해야 한다.
 */
export const IN_APP_BROWSER_PATTERN = /KAKAOTALK|Instagram|Threads|FB[AS]V|Line\/|NAVER|DaumApps/i;

export const isInAppBrowserUA = (ua: string) => IN_APP_BROWSER_PATTERN.test(ua);
