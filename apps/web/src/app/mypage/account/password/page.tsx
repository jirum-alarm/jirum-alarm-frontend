'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ChangePassword from '@/app/mypage/account/password/change/components/ChangePassword';
import CurrentPassword from '@/app/mypage/account/password/current/components/CurrentPassword';
import BackButton from '@/components/layout/BackButton';
import BasicLayout from '@/components/layout/BasicLayout';
import useMyRouter from '@/hooks/useMyRouter';

const QUERY_PARAM_PREFIX = 'step';
const INITIAL_STEP = 'current';
const STEPS = ['current', 'change'] as const;
type Steps = (typeof STEPS)[number];

const PasswordPage = () => {
  const router = useMyRouter();
  const searchParams = useSearchParams();
  const urlSteps = searchParams.get(QUERY_PARAM_PREFIX) as Steps;
  const [currentStep, setCurrentStep] = useState<Steps>(INITIAL_STEP);
  const nextStep = (steps: Steps) => {
    setCurrentStep(steps);
    router.push(`?${QUERY_PARAM_PREFIX}=${steps}`);
  };

  useEffect(() => {
    router.replace(`?${QUERY_PARAM_PREFIX}=${INITIAL_STEP}`);
  }, [router]);

  useEffect(() => {
    if (currentStep !== urlSteps) {
      setCurrentStep(urlSteps);
    }
  }, [urlSteps]);

  const handleBackButton = () => {
    const currentStepIndex = STEPS.findIndex((step) => step === currentStep);
    setCurrentStep(STEPS[currentStepIndex - 1]);
  };

  return (
    <BasicLayout
      // title="비밀번호 변경"
      fullScreen={true}
      header={
        <header className="fixed top-0 z-50 flex h-14 w-full max-w-screen-layout-max items-center justify-center bg-white">
          <div className="absolute left-0">
            <BackButton onClick={handleBackButton} />
          </div>
          <h1 className="text-lg font-semibold text-black">비밀번호 변경</h1>
        </header>
      }
    >
      {currentStep === 'current' && <CurrentPassword nextStep={() => nextStep('change')} />}
      {currentStep === 'change' && <ChangePassword />}
    </BasicLayout>
  );
};

export default PasswordPage;
