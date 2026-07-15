// 토스 심볼 로고. public/toss-symbol.png (alpha).
export default function TossIcon({ size = 16 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/toss-symbol.png" alt="토스" width={size} height={size} />;
}
