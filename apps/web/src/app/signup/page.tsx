'use client';

import { useMutation } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useToast } from '@/components/common/Toast';
import BackButton from '@/components/layout/BackButton';
import BasicLayout from '@/components/layout/BasicLayout';
import { CATEGORIES } from '@/constants/categories';
import { ICategoryForm } from '@/features/categories/types';
import { MutationSignup } from '@/graphql/auth';
import { ISignupOutput, ISignupVariable } from '@/graphql/interface/auth';
import useMyRouter from '@/hooks/useMyRouter';
import { User } from '@/types/user';

import { setAccessToken, setRefreshToken } from '../actions/token';

import Categories from './categories/components/Categories';
import Email from './email/components/Email';
import Nickname from './nickname/components/Nickname';
import Password from './password/components/Password';
import Personal from './personal/components/Personal';
import TermsOfService from './terms-of-service/components/TermsOfService';

const COMPLETE_ROUTE = 'signup/complete';

const STEPS = [
  'termsOfService',
  'email',
  'password',
  'nickname',
  'categories',
  'personal',
  'complete',
] as const;
type Steps = (typeof STEPS)[number];

const INITIAL_STEP: Steps = 'termsOfService';
const LAST_STEP = STEPS[STEPS.length - 1];
const QUERY_PARM_PREFIX = 'steps';

interface Input {
  value: string;
  error: boolean;
  focus: boolean;
}

interface Personal {
  birthYear?: string | null;
  gender: User['gender'] | null;
}

export interface Registration {
  email: Input;
  password: Input & { invalidType: boolean; invalidLength: boolean };
  termsOfService: boolean;
  privacyPolicy: boolean;
  nickname: Input;
  categories: ICategoryForm[];
  personal: Personal;
}

const Signup = () => {
  const [registration, setRegistration] = useState<Registration>({
    email: { value: '', error: false, focus: false },
    password: {
      value: '',
      error: false,
      invalidType: false,
      invalidLength: false,
      focus: false,
    },
    termsOfService: false,
    privacyPolicy: false,
    nickname: { value: '', error: false, focus: false },
    categories: CATEGORIES.map((category) => ({
      ...category,
      isChecked: false,
    })),
    personal: { birthYear: '', gender: undefined },
  });

  const router = useMyRouter();

  const searchParams = useSearchParams();
  const { toast } = useToast();

  const urlSteps = searchParams.get(QUERY_PARM_PREFIX) as Steps;
  const [currentStep, setCurrentStep] = useState<Steps>(INITIAL_STEP);

  const [signup] = useMutation<ISignupOutput, ISignupVariable>(MutationSignup, {
    onCompleted: async (data) => {
      await setAccessToken(data.signup.accessToken);

      if (data.signup.refreshToken) {
        await setRefreshToken(data.signup.refreshToken);
      }

      router.push(COMPLETE_ROUTE);
    },
    onError: () => {
      toast('회원가입에 실패했어요');
    },
  });

  const moveNextStep = (steps: Steps) => {
    if (LAST_STEP === steps) {
      completeRegistration();
      return;
    }
    setCurrentStep(steps);
    router.push(`?${QUERY_PARM_PREFIX}=${steps}`);
  };

  const completeRegistration = async () => {
    const { email, password, nickname, personal, categories } = registration;
    const { birthYear, gender } = personal;

    const favoriteCategories = categories.reduce<number[]>((cur, acc) => {
      if (acc.isChecked) {
        cur.push(acc.value);
      }
      return cur;
    }, []);

    const _birthYear = birthYear ? Number(birthYear) : null;

    await signup({
      variables: {
        email: email.value,
        password: password.value,
        nickname: nickname.value,
        birthYear: _birthYear,
        gender,
        favoriteCategories,
      },
    });

    // TODO: Need GTM Migration
    // mp?.set_user({
    //   $name: nickname.value,
    //   $email: email.value,
    //   birthYear,
    //   gender,
    // });
  };

  const handleRegistration = (
    _registration: Partial<Registration> | ((registration: Registration) => Partial<Registration>),
  ) => {
    const next = typeof _registration === 'function' ? _registration(registration) : _registration;

    setRegistration((prev) => ({
      ...prev,
      ...next,
    }));
  };

  useEffect(() => {
    router.replace(`?${QUERY_PARM_PREFIX}=${INITIAL_STEP}`);
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
      // hasBackButton
      fullScreen={false}
      header={
        <header className="sticky top-0 z-50 flex h-14 w-full max-w-screen-layout-max items-center justify-center bg-white">
          <div className="absolute left-0">
            <BackButton onClick={handleBackButton} />
          </div>
        </header>
      }
    >
      <div className="px-5 py-9">
        {currentStep === 'termsOfService' && (
          <TermsOfService
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('email')}
          />
        )}
        {currentStep === 'email' && (
          <Email
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('password')}
          />
        )}
        {currentStep === 'password' && (
          <Password
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('nickname')}
          />
        )}
        {currentStep === 'nickname' && (
          <Nickname
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('categories')}
          />
        )}
        {currentStep === 'categories' && (
          <Categories
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('personal')}
          />
        )}
        {currentStep === 'personal' && (
          <Personal
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('complete')}
          />
        )}
      </div>
    </BasicLayout>
  );
};

const SignupPage = () => {
  return (
    <Suspense>
      <Signup />
    </Suspense>
  );
};

export default SignupPage;
