// 네이버 로고타입(워드마크). public/naver-logo.svg (2315×444 ≈ 5.2:1, 그린).
// 토스는 정사각 심볼이지만 네이버 공식 리소스는 워드마크뿐이라 높이 기준으로 폭 자동.
export default function NaverIcon({ height = 12 }: { height?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src="/naver-logo.svg" alt="네이버" height={height} style={{ height, width: 'auto' }} />
  );
}
