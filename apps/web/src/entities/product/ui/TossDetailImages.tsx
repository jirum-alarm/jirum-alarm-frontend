'use client';

import { useInView } from 'react-intersection-observer';

/**
 * 토스 상세 상품 이미지. 여러 장을 여백 없이 세로로 이어붙인다(상세페이지 관행).
 *
 * 뷰포트 근처에 와서야 <img> 를 그린다. `loading="lazy"` 만으론 부족했다 — 크기 정보가 없어 14장이
 * 전부 폴드 바로 아래 한 점에 겹쳐 있고, 크롬의 lazy 임계(느린 회선 2500px)에 다 들어와
 * LCP 와 같은 시점에 250KB 가 내려갔다(Slow 4G 실측). SSR 엔 lazy 아닌 <img> 마다 preload 힌트도 붙는다.
 * 그려진 뒤엔 lazy 로 두어 멀리 있는 장은 여전히 스크롤 때 받는다.
 */
export default function TossDetailImages({ images }: { images?: string[] }) {
  // 섹션 상단이 뷰포트 400px 안으로 들어올 때 한 번만.
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '400px 0px' });

  if (!images?.length) {
    return null;
  }

  return (
    <div ref={ref} className="w-full">
      {inView ? (
        images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`상품 상세 이미지 ${i + 1}`}
            className="block w-full"
            loading="lazy"
            decoding="async"
          />
        ))
      ) : (
        // 첫 장 자리(정사각 근사). 이미지가 들어오면 실제 높이로 바뀐다.
        <div className="aspect-square w-full bg-gray-50" aria-hidden="true" />
      )}
    </div>
  );
}
