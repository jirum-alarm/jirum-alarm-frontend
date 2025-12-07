'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import useMyRouter from '@shared/hooks/useMyRouter';
import BackButton from '@shared/ui/layout/BackButton';
import BasicLayout from '@shared/ui/layout/BasicLayout';

import ChangePassword from './change/components/ChangePassword';
import CurrentPassword from './current/components/CurrentPassword';

const QUERY_PARAM_PREFIX = 'step';
const INITIAL_STEP = 'current';
const STEPS = ['current', 'change'] as const;
type Steps = (typeof STEPS)[number];

const Password = () => {
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
        <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5">
          <div className="flex items-center">
            <BackButton onClick={handleBackButton} />
          </div>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
            비밀번호 변경
          </h1>
        </header>
      }
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
