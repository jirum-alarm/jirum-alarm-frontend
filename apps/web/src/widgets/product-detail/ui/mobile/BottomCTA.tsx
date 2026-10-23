'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';

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
import { type CtaVariant, pickCtaVariant } from '../../lib/samsung-cta-experiment';

export default function BottomCTA({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const detailUrl = product?.detailUrl || null;
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
  const buyRef = useRef<HTMLElement>(null);
  // 삼성 인터넷은 버튼(samsung-cta-experiment.ts — 떠 있는 링크를 숨긴다). 서버 렌더는 늘 링크, 하이드레이션 직후 UA 로 정한다.
  const [variant, setVariant] = useState<CtaVariant | null>(null);
  const variantRef = useRef<CtaVariant | null>(null);
  useEffect(() => {
    const picked = pickCtaVariant(navigator.userAgent);
    variantRef.current = picked;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 UA 는 마운트 뒤에만 안다
    setVariant(picked);
  }, []);
  const setMissingProduct = useSetAtom(bottomCtaMissingProductAtom);
  // 본문 버튼은 1초에 먼저 띄운다(3초를 기다리면 그동안 구매 버튼이 하나도 없다). 계측 이벤트는 비교 가능하게 3초 그대로.
  useEffect(() => {
    const early = window.setTimeout(() => {
      const rect = buyRef.current?.getBoundingClientRect();
      if (rect && rect.width === 0 && rect.height === 0) setMissingProduct(productId);
    }, 1000);
    const report = window.setTimeout(() => {
      if (!buyRef.current) return;
      if (reportCtaVisibility(buyRef.current, variantRef.current) === 'not_rendered')
        setMissingProduct(productId);
    }, 3000);
    return () => {
      window.clearTimeout(early);
      window.clearTimeout(report);
    };
  }, [productId, setMissingProduct]);

  const handlePurchaseClick = () => {
    // 구매 링크는 target=_blank 라 유저는 이 페이지로 돌아온다. 그때만 알림/오카방을 권한다.
    startPrompts();
    recordPurchaseClick({ productId, product, source: 'detail_mobile' });
  };

  return (
    // 군이 정해지면 바를 새 노드로 다시 그린다 — 옛 노드에 이미 걸린 숨김이 새 군에 묻어나지 않게.
    <div
      key={variant ?? 'ssr'}
      className="max-w-mobile-max pb-safe-bottom fixed bottom-0 left-1/2 z-50 mx-auto w-full -translate-x-1/2 border-t border-t-gray-300 bg-white"
    >
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
        {!detailUrl ? (
          // 구매 링크가 아직 없다(수집 중·몰 링크 없음) — 예전엔 href='' 링크라 같은 페이지를 새 탭으로 열거나
          // 버튼 군은 클릭 기록만 남기고 아무 일이 없었다(Clarity dead click). 누를 수 없는 버튼 + 상태 문구로.
          // buyRef 를 달지 않는다 — 삼성 인터넷 숨김 판정(본문 대체 버튼)은 링크가 있을 때만 뜻이 있다.
          <Button disabled className="h-12 flex-1 px-6 text-base font-semibold">
            구매 링크 준비 중
          </Button>
        ) : variant === 'button' ? (
          // 삼성 인터넷 — href 없는 버튼이 클릭 때 새 창을 연다(떠 있는 외부 링크로 안 보이게).
          <Button
            ref={buyRef as React.RefObject<HTMLButtonElement>}
            className="h-12 flex-1 px-6 text-base font-semibold"
            onClick={() => {
              handlePurchaseClick();
              window.open(detailUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            구매하러 가기
          </Button>
        ) : (
          <a
            ref={buyRef as React.RefObject<HTMLAnchorElement>}
            href={detailUrl}
            onClick={handlePurchaseClick}
            className="block flex-1"
            target="_blank"
            // 제휴 아웃바운드 — 크롤러가 따라가 봇클릭을 만들지 않게 nofollow/sponsored.
            // (10/16 삼성 인터넷 숨김 의심으로 sponsored 를 뺐지만 숨김 비율이 그대로라 되돌렸다 — cta-visibility.ts)
            rel="nofollow sponsored noopener noreferrer"
          >
            <Button className="h-12 w-full px-6 text-base font-semibold">구매하러 가기</Button>
          </a>
        )}
      </div>
    </div>
  );
}
