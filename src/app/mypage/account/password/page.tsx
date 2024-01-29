'use client';
import BasicLayout from '@/components/layout/BasicLayout';
import CurrentPasswordForm from './components/CurrentPasswordForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import ChangePasswordForm from './components/ChangePasswordForm';

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
      {steps === 'current' && <CurrentPasswordForm nextStep={() => nextStep('change')} />}
      {steps === 'change' && <ChangePasswordForm />}
    </BasicLayout>
  );
};

export default PasswordPage;
