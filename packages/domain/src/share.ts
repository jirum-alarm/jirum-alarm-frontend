/**
 * 공유 시트의 채널 이름 — 보이는 글자(label)와 화면 읽기 이름(a11y). web·앱 공유 시트가 같이 쓴다.
 *
 * a11y 는 조사까지 적는다. 예전엔 `${label}(으)로 공유` 라 VoiceOver·TalkBack 이 「카카오톡 으 로 공유」로 읽었다.
 * 채널이 몇 개 안 되는 고정 문구라 조사 라이브러리 대신 문구를 적는다(web 상세 첫 로드 JS 를 늘릴 일이 아니었다).
 * 아이콘·색은 플랫폼마다 붙인다(2026-10-20 정본화 — 전엔 두 시트가 같은 표를 따로 들고 앱 테스트가 web 파일을 대조했다).
 */
export const SHARE_CHANNEL_COPY = {
  kakao: { label: '카카오톡', a11y: '카카오톡으로 공유' },
  x: { label: 'X', a11y: 'X로 공유' },
  threads: { label: '스레드', a11y: '스레드로 공유' },
  native: { label: '다른 앱', a11y: '다른 앱으로 공유' },
} as const;
