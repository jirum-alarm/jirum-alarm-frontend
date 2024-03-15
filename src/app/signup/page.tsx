'use client';

import { useEffect, useState } from 'react';
import BasicLayout from '@/components/layout/BasicLayout';
import Email from './email/components/Email';
import Password from './password/components/Password';
import TermsOfService from './terms-of-service/components/TermsOfService';
import Nickname from './nickname/components/Nickname';
import { useMutation } from '@apollo/client';
import { MutationSignup } from '@/graphql/auth';
import { ISignupVariable, ISignupOutput } from '@/graphql/interface/auth';
import { StorageTokenKey } from '@/types/enum/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Categories from './categories/components/Categories';
import { ICategoryForm } from '@/features/categories/types';
import { CATEGORIES } from '@/constants/categories';
import Personal from './personal/components/Personal';
import { User } from '@/types/user';
import { useToast } from '@/components/common/Toast';
import { addPushTokenVariable } from '@/graphql/interface';
import { MutationAddPushToken } from '@/graphql/notification';

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

  const [addPushToken] = useMutation<unknown, addPushTokenVariable>(MutationAddPushToken, {
    onError: (e) => {
      console.error(e);
    },
  });

  const [signup] = useMutation<ISignupOutput, ISignupVariable>(MutationSignup, {
    onCompleted: (data) => {
      localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, data.signup.accessToken);

      if (data.signup.refreshToken) {
        localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, data.signup.refreshToken);
      }

      // addPushToken({
      //   variables: {
      //     token: '',
      //     tokenType: '',
      //   },
      // });

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
