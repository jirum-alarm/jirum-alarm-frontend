'use client'

import { useEffect, useState } from 'react'
import BasicLayout from '@/components/layout/BasicLayout'
import RegisterByEmail from './components/RegisterByEmail'
import AgreeTermsOfService from './components/AgreeTermsOfService'
import SetupNickname from './components/SetupNickname'
import { useMutation } from '@apollo/client'
import { MutationSignup } from '@/graphql/auth'
import { ISignupVariable, ISignupOutput } from '@/graphql/interface/auth'
import { StorageTokenKey } from '@/types/enum/auth'
import { useRouter, useSearchParams } from 'next/navigation'

const STEPS = ['emailAndPassword', 'termsOfService', 'nickname'] as const
type Steps = (typeof STEPS)[number]

const INITIAL_STEP = 'emailAndPassword'

interface Input {
  value: string
  error: boolean
  focus: boolean
}

export interface Registration {
  email: Input
  password: Input
  termsOfService: boolean
  privacyPolicy: boolean
  nickname: Input
}

const Signup = () => {
  const [steps, setSteps] = useState<Steps>('emailAndPassword')
  const [registraion, setRegistration] = useState<Registration>({
    email: { value: '', error: false, focus: false },
    password: { value: '', error: false, focus: false },
    termsOfService: false,
    privacyPolicy: false,
    nickname: { value: '', error: false, focus: false },
  })

  const router = useRouter()
  const searchParams = useSearchParams()

  const [signup] = useMutation<ISignupOutput, ISignupVariable>(MutationSignup, {
    onCompleted: (data) => {
      localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, data.signup.accessToken)

      if (data.signup.refreshToken) {
        localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, data.signup.refreshToken)
      }

      router.push('signup/complete')
    },
  })

  const moveNextStep = (steps: Steps) => {
    setSteps(steps)
    router.push(`?steps=${steps}`)
  }

  const handleRegistration = (
    _registraion: Partial<Registration> | ((registration: Registration) => Partial<Registration>),
  ) => {
    const next = typeof _registraion === 'function' ? _registraion(registraion) : _registraion

    setRegistration((prev) => ({
      ...prev,
      ...next,
    }))
  }

  const completeRegistration = async () => {
    const { email, password, nickname } = registraion

    // @TODO: brithYear, gender, favoriteCategories 실제 데이터로 교체
    await signup({
      variables: {
        email: email.value,
        password: password.value,
        nickname: nickname.value,
        birthYear: 20020202.0,
        gender: 'FEMALE',
        favoriteCategories: [1],
      },
    })
  }

  useEffect(() => {
    router.replace(`?steps=${INITIAL_STEP}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const steps = searchParams.get('steps') as Steps

    setSteps(steps)
  }, [searchParams])

  return (
    <BasicLayout hasBackButton>
      <div className="h-[85vh] py-9 px-5">
        {steps === 'emailAndPassword' && (
          <RegisterByEmail
            registration={registraion}
            handleRegistration={handleRegistration}
            moveNextStep={() => moveNextStep('termsOfService')}
          />
        )}
        {steps === 'termsOfService' && (
          <AgreeTermsOfService
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
  )
}

export default Signup
