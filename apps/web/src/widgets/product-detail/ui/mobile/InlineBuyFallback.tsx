'use client';

import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import Button from '@/shared/ui/common/Button';

import { ProductQueries } from '@/entities/product';

import { bottomCtaMissingProductAtom } from '../../lib/bottom-cta-missing';
import { recordPurchaseClick } from '../../lib/purchase-click';

// 하단 고정 구매 바가 그려지지 않은 사용자에게만(BottomCTA 가 not_rendered 를 감지) 가격 아래에 보이는 구매 버튼.
// 떠 있지 않은 보통 흐름의 링크라 「떠 있는 광고」로 숨겨지지 않는다. 정상 사용자 화면은 그대로다.
export default function InlineBuyFallback({ productId }: { productId: number }) {
  const missingProductId = useAtomValue(bottomCtaMissingProductAtom);
  const { data: product } = useQuery({
    ...ProductQueries.productInfo({ id: productId }),
    enabled: missingProductId === productId,
  });
  if (missingProductId !== productId || !product?.detailUrl) return null;

  return (
    <a
      href={product.detailUrl}
      onClick={() => recordPurchaseClick({ productId, product, source: 'detail_mobile_inline' })}
      className="mt-3 block"
      target="_blank"
      rel="nofollow noopener noreferrer"
    >
      <Button className="h-12 w-full px-6 text-base font-semibold">구매하러 가기</Button>
    </a>
  );
}
