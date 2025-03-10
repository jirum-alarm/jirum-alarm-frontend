'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import ChangePassword from '../change/components/ChangePassword';
import CurrentPassword from '../current/components/CurrentPassword';
import useMyRouter from '@/hooks/useMyRouter';

const QUERY_PARAM_PREFIX = 'step';
const INITIAL_STEP = 'current';
const STEPS = ['current', 'change'] as const;
type Steps = (typeof STEPS)[number];

const PasswordContainerPage = () => {
  const router = useMyRouter();
  const searchParams = useSearchParams();
  const steps = searchParams.get(QUERY_PARAM_PREFIX) as Steps;
  const nextStep = (steps: Steps) => {
    router.push(`?${QUERY_PARAM_PREFIX}=${steps}`);
  };

  useEffect(() => {
    router.replace(`?${QUERY_PARAM_PREFIX}=${INITIAL_STEP}`);
  }, [router]);

  return (
    <>
      {steps === 'current' && <CurrentPassword nextStep={() => nextStep('change')} />}
      {steps === 'change' && <ChangePassword />}
    </>
  );
};

export default PasswordContainerPage;
