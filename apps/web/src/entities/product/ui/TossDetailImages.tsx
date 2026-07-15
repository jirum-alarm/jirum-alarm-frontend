// 토스 상세 상품 이미지. 여러 장을 여백 없이 세로로 이어붙인다(상세페이지 관행).
// block + w-full 로 이미지 간 간격 제거(inline 이미지의 baseline 여백 방지).
export default function TossDetailImages({ images }: { images?: string[] }) {
  if (!images?.length) {
    return null;
  }
  return (
    <div className="w-full">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={`상품 상세 이미지 ${i + 1}`} className="block w-full" />
      ))}
    </div>
  );
}
