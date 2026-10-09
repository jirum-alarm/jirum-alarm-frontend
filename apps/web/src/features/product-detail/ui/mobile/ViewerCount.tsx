'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';

interface ViewerCountProps {
  productId: number;
}

/**
 * 이미지 위에 겹쳐 띄우는 알약. 높이 0 인 sticky 줄이라 본문을 밀지 않는다 —
 * 예전엔 48px 띠가 이미지 위에 자리를 차지해, 네이버 인앱(툴바 때문에 화면이 짧다)에서 가격이 첫 화면 밖으로 밀렸다.
 */
export default function ViewerCount({ productId }: ViewerCountProps) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  const count = product.viewCount;

  if (count < 10) return null;

  return (
    <div className="sticky top-14 z-50 h-0 w-full">
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
