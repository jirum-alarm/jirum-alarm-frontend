'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';

interface ViewerCountProps {
  productId: number;
}

/**
 * 이미지 위에 겹쳐 띄우는 알약. 이미지 상자 안 absolute 라 본문을 밀지 않는다 —
 * 예전엔 48px 띠가 이미지 위에 자리를 차지해, 네이버 인앱(툴바 때문에 화면이 짧다)에서 가격이 첫 화면 밖으로 밀렸다.
 * 페이지 최상단 sticky 로 두면 스크롤 내내 따라다니며 본문 글자와 애드센스 광고까지 덮는다(2026-10-12) —
 * 이미지 상자에 두면 본문 패널이 올라올 때 이미지와 함께 가려진다.
 */
export default function ViewerCount({ productId }: ViewerCountProps) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  const count = product.viewCount;

  if (count < 10) return null;

  return (
    <div className="absolute inset-x-0 top-0 z-10">
      <div className="flex justify-center pt-3">
        <span className="bg-secondary-50 border-secondary-200 flex h-9 items-center rounded-full border px-4 text-sm whitespace-nowrap text-gray-700">
          <strong className="text-secondary-500 font-semibold" suppressHydrationWarning>
            {count.toLocaleString('ko-kr')}명
          </strong>
          이 살펴본 상품
        </span>
      </div>
    </div>
  );
}
