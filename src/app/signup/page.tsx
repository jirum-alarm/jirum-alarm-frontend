'use client';

import { useEffect, useState } from 'react';
import BasicLayout from '@/components/layout/BasicLayout';
import Email from './components/Email';
import Password from './components/Password';
import AgreeTermsOfService from './components/AgreeTermsOfService';
import SetupNickname from './components/SetupNickname';
import { useMutation } from '@apollo/client';
import { MutationSignup } from '@/graphql/auth';
import { ISignupVariable, ISignupOutput } from '@/graphql/interface/auth';
import { StorageTokenKey } from '@/types/enum/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const STEPS = ['termsOfService', 'email', 'password', 'nickname'] as const;
type Steps = (typeof STEPS)[number];

const INITIAL_STEP = 'termsOfService';
const QUERY_PARM_PREFIX = 'steps';

interface Input {
  value: string;
  error: boolean;
  focus: boolean;
}

export interface Registration {
  email: Input;
  password: Input & { invalidType: boolean; invalidLength: boolean };
  termsOfService: boolean;
  privacyPolicy: boolean;
  nickname: Input;
}

const Signup = () => {
  const [registraion, setRegistration] = useState<Registration>({
    email: { value: '', error: false, focus: false },
    password: { value: '', error: false, invalidType: false, invalidLength: false, focus: false },
    termsOfService: false,
    privacyPolicy: false,
    nickname: { value: '', error: false, focus: false },
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const steps = searchParams.get(QUERY_PARM_PREFIX) as Steps;

  const [signup] = useMutation<ISignupOutput, ISignupVariable>(MutationSignup, {
    onCompleted: (data) => {
      localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, data.signup.accessToken);

      if (data.signup.refreshToken) {
        localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, data.signup.refreshToken);
      }

      router.push('signup/complete');
    },
  });

  const moveNextStep = (steps: Steps) => {
    router.push(`?${QUERY_PARM_PREFIX}=${steps}`);
  };

  const handleRegistration = (
    _registraion: Partial<Registration> | ((registration: Registration) => Partial<Registration>),
  ) => {
    const next = typeof _registraion === 'function' ? _registraion(registraion) : _registraion;

    setRegistration((prev) => ({
      ...prev,
      ...next,
    }));
  };

  const completeRegistration = async () => {
    const { email, password, nickname } = registraion;

    await signup({
      variables: {
        email: email.value,
        password: password.value,
        nickname: nickname.value,
      },
    });
  };

  useEffect(() => {
    router.replace(`?${QUERY_PARM_PREFIX}=${INITIAL_STEP}`);
  }, [router]);

  return (
    <BasicLayout hasBackButton>
      <div className="h-full py-9 px-5">
        {steps === 'termsOfService' && (
          <AgreeTermsOfService
            registration={registraion}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('email')}
          />
        )}
        {steps === 'email' && (
          <Email
            registration={registraion}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('password')}
          />
        )}
        {steps === 'password' && (
          <Password
            registration={registraion}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('nickname')}
          />
        )}
        {steps === 'nickname' && (
          <SetupNickname
            registration={registraion}
            handleRegistration={handleRegistration}
            completeRegistration={completeRegistration}
          />
        )}
      </div>
    </BasicLayout>
  );
};

export default Signup;
