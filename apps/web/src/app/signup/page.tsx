'use client';

import { useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { setAccessToken, setRefreshToken } from '../actions/token';
import Categories from './categories/components/Categories';
import Email from './email/components/Email';
import Nickname from './nickname/components/Nickname';
import Password from './password/components/Password';
import Personal from './personal/components/Personal';
import TermsOfService from './terms-of-service/components/TermsOfService';

import { useToast } from '@/components/common/Toast';
import BasicLayout from '@/components/layout/BasicLayout';
import { CATEGORIES } from '@/constants/categories';
import { ICategoryForm } from '@/features/categories/types';
import { MutationSignup } from '@/graphql/auth';
import { ISignupVariable, ISignupOutput } from '@/graphql/interface/auth';
import { User } from '@/types/user';

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
    password: { value: '', error: false, invalidType: false, invalidLength: false, focus: false },
    termsOfService: false,
    privacyPolicy: false,
    nickname: { value: '', error: false, focus: false },
    categories: CATEGORIES.map((category) => ({ ...category, isChecked: false })),
    personal: { birthYear: '', gender: undefined },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const steps = searchParams.get(QUERY_PARM_PREFIX) as Steps;

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

  return (
    <BasicLayout hasBackButton fullScreen={false}>
      <div className="px-5 py-9">
        {steps === 'termsOfService' && (
          <TermsOfService
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('email')}
          />
        )}
        {steps === 'email' && (
          <Email
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('password')}
          />
        )}
        {steps === 'password' && (
          <Password
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('nickname')}
          />
        )}
        {steps === 'nickname' && (
          <Nickname
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('categories')}
          />
        )}
        {steps === 'categories' && (
          <Categories
            registration={registration}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('personal')}
          />
        )}
        {steps === 'personal' && (
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

export default Signup;
