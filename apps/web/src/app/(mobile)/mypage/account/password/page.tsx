'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import useMyRouter from '@/shared/hooks/useMyRouter';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import PageHeader from '@/shared/ui/layout/PageHeader';

import ChangePassword from '@/features/mypage/ui/password/ChangePassword';
import CurrentPassword from '@/features/mypage/ui/password/CurrentPassword';

const QUERY_PARAM_PREFIX = 'step';
const INITIAL_STEP = 'current';
const STEPS = ['current', 'change'] as const;
type Steps = (typeof STEPS)[number];

const Password = () => {
  const router = useMyRouter();
  const searchParams = useSearchParams();
  // 단계의 정본은 URL 이다(뒤로 가기·앞으로 가기가 단계를 오간다). 첫 진입엔 아래 replace 전까지 step 이 없어 첫 단계를 보인다.
  const currentStep = (searchParams.get(QUERY_PARAM_PREFIX) as Steps | null) ?? INITIAL_STEP;
  const nextStep = (steps: Steps) => {
    router.push(`/mypage/account/password?${QUERY_PARAM_PREFIX}=${steps}`);
  };

  useEffect(() => {
    router.replace(`/mypage/account/password?${QUERY_PARAM_PREFIX}=${INITIAL_STEP}`);
  }, [router]);

  return (
    <BasicLayout
      // title="비밀번호 변경"
      fullScreen={true}
      header={<PageHeader leading={<BackButton />} title="비밀번호 변경" />}
    >
      {currentStep === 'current' && <CurrentPassword nextStep={() => nextStep('change')} />}
      {currentStep === 'change' && <ChangePassword />}
    </BasicLayout>
  );
};

const PasswordPage = () => {
  return (
    <Suspense>
      <Password />
    </Suspense>
  );
};

export default PasswordPage;
