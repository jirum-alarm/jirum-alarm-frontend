'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import Button from '@/shared/ui/common/Button';
import TopButton from '@/shared/ui/TopButton';

import { ProductQueries } from '@/entities/product';

import { LikeButton } from '@/features/product-actions/ui';
import { useBeautyRoomAssignment } from '@/features/product-detail/lib/useBeautyRoomAssignment';
import { usePostPurchasePrompts } from '@/features/product-detail/lib/usePostPurchasePrompts';
import PostPurchaseKakaoPrompt from '@/features/product-detail/ui/PostPurchaseKakaoPrompt';
import PostPurchaseKeywordPrompt from '@/features/product-detail/ui/PostPurchaseKeywordPrompt';

import { bottomCtaMissingProductAtom } from '../../lib/bottom-cta-missing';
import { reportCtaVisibility } from '../../lib/cta-visibility';
import { recordPurchaseClick } from '../../lib/purchase-click';

export default function BottomCTA({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  // 화장품 상세 실험 beauty_detail_room_v1 — b 군은 구매 후 권유도 뷰티방(입장 기록도 뷰티방 것으로 본다).
  const beautyRoom = useBeautyRoomAssignment(product?.categoryId);
  const {
    phase,
    start: startPrompts,
    advance: advancePrompt,
  } = usePostPurchasePrompts({ productId, isUserLogin, beautyRoom });

  // 구매 버튼이 화면 안에 보이는지 한 번 잰다(삼성 인터넷 30 구매 클릭 급감 판정용, cta-visibility.ts).
  // 첫 화면 시트·주소창 애니메이션이 가라앉은 뒤에 잰다.
  // 그려지지 않았으면(삼성 인터넷이 떠 있는 제휴 링크를 숨긴다) 가격 아래 본문에 구매 버튼을 대신 띄운다.
  const buyRef = useRef<HTMLAnchorElement>(null);
  const setMissingProduct = useSetAtom(bottomCtaMissingProductAtom);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!buyRef.current) return;
      if (reportCtaVisibility(buyRef.current) === 'not_rendered') setMissingProduct(productId);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [productId, setMissingProduct]);

  const handlePurchaseClick = () => {
    // 구매 링크는 target=_blank 라 유저는 이 페이지로 돌아온다. 그때만 알림/오카방을 권한다.
    startPrompts();
    recordPurchaseClick({ productId, product, source: 'detail_mobile' });
  };

  return (
    <div className="max-w-mobile-max pb-safe-bottom fixed bottom-0 left-1/2 z-50 mx-auto w-full -translate-x-1/2 border-t border-t-gray-300 bg-white">
      <PostPurchaseKakaoPrompt
        show={phase === 'kakao'}
        onClose={advancePrompt}
        className="border-b border-gray-100 px-5"
        beautyRoom={beautyRoom}
      />
      <PostPurchaseKeywordPrompt
        show={phase === 'keyword'}
        title={product?.title ?? ''}
        onClose={advancePrompt}
        className="border-b border-gray-100 px-5"
      />
      <div className="flex w-full items-center gap-x-4 px-5 py-2">
        <TopButton />
        <div className="flex h-12 items-center">
          <LikeButton productId={productId} isUserLogin={isUserLogin} />
        </div>
        <a
          ref={buyRef}
          href={product?.detailUrl ?? ''}
          onClick={handlePurchaseClick}
          className="block flex-1"
          target="_blank"
          // 제휴 아웃바운드 — 크롤러가 따라가 봇클릭을 만들지 않게 nofollow.
          // sponsored 는 뺀다: 삼성 인터넷이 「떠 있는 요소 + sponsored 링크」를 광고로 보고 이 바를 숨겼다(cta-visibility.ts).
          rel="nofollow noopener noreferrer"
        >
          <Button className="h-12 w-full px-6 text-base font-semibold">구매하러 가기</Button>
        </a>
      </div>
    </div>
  );
}
