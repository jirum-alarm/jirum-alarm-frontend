'use client';
import BasicLayout from '@/components/layout/BasicLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import CurrentPassword from './current/components/CurrentPassword';
import ChangePassword from './change/components/ChangePassword';

const QUERY_PARAM_PREFIX = 'step';
const INITIAL_STEP = 'current';
const STEPS = ['current', 'change'] as const;
type Steps = (typeof STEPS)[number];

const PasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const steps = searchParams.get(QUERY_PARAM_PREFIX) as Steps;
  const nextStep = (steps: Steps) => {
    router.push(`?${QUERY_PARAM_PREFIX}=${steps}`);
  };

  useEffect(() => {
    router.replace(`?${QUERY_PARAM_PREFIX}=${INITIAL_STEP}`);
  }, [router]);

  return (
    <BasicLayout title="비밀번호 변경" hasBackButton>
      {steps === 'current' && <CurrentPassword nextStep={() => nextStep('change')} />}
      {steps === 'change' && <ChangePassword />}
    </BasicLayout>
  );
};

export default PasswordPage;
