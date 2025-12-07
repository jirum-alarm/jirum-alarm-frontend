'use client';

import { useMutation } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense, useEffect, useState } from 'react';

import { AuthService } from '@shared/api/auth/auth.service';
import { Gender } from '@shared/api/gql/graphql';
import { CATEGORIES } from '@shared/config/categories';
import useMyRouter from '@shared/hooks/useMyRouter';
import BasicLayout from '@shared/ui/layout/BasicLayout';
import { useToast } from '@shared/ui/Toast';

import { type ICategoryForm } from '@entities/category';

import Categories from '@features/auth/signup/ui/Categories';
import Email from '@features/auth/signup/ui/Email';
import Nickname from '@features/auth/signup/ui/Nickname';
import Password from '@features/auth/signup/ui/Password';
import Personal from '@features/auth/signup/ui/Personal';
import TermsOfService from '@features/auth/signup/ui/TermsOfService';

import { setAccessToken, setRefreshToken } from '../../actions/token';

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
  gender: Gender | null;
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
    personal: { birthYear: '', gender: null },
  });

  const router = useMyRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useQueryState(QUERY_PARM_PREFIX, {
    defaultValue: INITIAL_STEP,
  });

  const { mutateAsync: signup } = useMutation({
    mutationFn: AuthService.signupUser,
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

    const data = await signup({
      email: email.value,
      password: password.value,
      nickname: nickname.value,
      birthYear: _birthYear as any,
      gender: gender as any,
      favoriteCategories,
    });

    await setAccessToken(data.signup.accessToken);
    if (data.signup.refreshToken) {
      await setRefreshToken(data.signup.refreshToken);
    }
    router.push(COMPLETE_ROUTE);

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

  const handleBackButton = () => {
    const currentStepIndex = STEPS.findIndex((step) => step === currentStep);
    setCurrentStep(STEPS[currentStepIndex - 1]);
  };

  return (
    <BasicLayout hasBackButton fullScreen={false}>
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
