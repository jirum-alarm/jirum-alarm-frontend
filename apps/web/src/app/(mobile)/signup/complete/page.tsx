'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import useMyRouter from '@/shared/hooks/useMyRouter';
import { WindowLocation } from '@/shared/lib/window-location';
import Button from '@/shared/ui/common/Button';
import { Illust } from '@/shared/ui/common/icons/Illust';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { resolveReturnUrl } from '@/features/auth/lib/return-url';

import SignupKeyword from './SignupKeyword';

const Completed = () => {
  const router = useMyRouter();
  const searchParams = useSearchParams();
  // 소셜 가입은 가입 전 의도한 곳(rtnUrl)으로, 그 외엔 홈으로.
  // rtnUrl 이 다른 오리진(ai.jirum-alarm.com 등)이면 라우터가 못 가므로 브라우저 이동을 쓴다.
  const target = resolveReturnUrl(searchParams.get('rtnUrl'), WindowLocation.getCurrentOrigin());
  // 상품 상세에서 가입했으면(가입의 81%) 그 상품으로 키워드를 추천한다.
  const productMatch = target.kind === 'internal' ? target.path.match(/^\/products\/(\d+)/) : null;
  const productId = productMatch ? Number(productMatch[1]) : null;

  // 가입 계측은 여기서 코드로 쏜다. 예전엔 GTM 이 "/signup/complete 로 URL 이 바뀌는 순간"
  // (historyChange)을 잡았는데, GTM 은 성능 때문에 load 뒤(lazyOnload)에 붙어서 OAuth 콜백이
  // 곧장 넘어오면 그 순간을 놓쳤다 — GA4 웹 가입 98건 vs DB ~360(2026-10-05).
  // dataLayer push 는 GTM 이 늦게 붙어도 큐에 남는다.
  const method = searchParams.get('method');
  useEffect(() => {
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'sign_up',
      method: method ?? 'unknown',
    });
  }, [method]);

  const handleCTAButton = () => {
    if (target.kind === 'external') {
      window.location.replace(target.url);
      return;
    }
    router.replace(target.path);
  };

  return (
    <BasicLayout fullScreen={false}>
      <div className="h-full px-5 py-9">
        <div className="grid h-full text-center">
          <div>
            <div className="grid justify-center pb-6">
              <Illust />
            </div>
            <div>
              <p className="pb-3 text-2xl font-semibold">가입을 축하합니다!</p>
            </div>
            <div className="pt-8 pb-28">
              <SignupKeyword productId={productId} />
            </div>
          </div>
          <div className="pc:static pc:max-w-none pc:px-0 pc:pt-10 pc:pb-0 fixed right-0 bottom-0 left-0 m-auto w-full max-w-[600px] px-5 pb-9">
            {/* 위 "알림 받기"가 이 화면의 제1 CTA 라 여긴 회색으로 물러선다. */}
            <Button onClick={handleCTAButton} color="secondary" className="self-end">
              핫딜 보러가기
            </Button>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

const CompletedPage = () => {
  return (
    <Suspense>
      <Completed />
    </Suspense>
  );
};

export default CompletedPage;
