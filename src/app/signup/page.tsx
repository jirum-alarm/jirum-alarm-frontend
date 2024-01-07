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

export interface Registration {
  email: string
  password: string
  termsOfService: boolean
  privacyPolicy: boolean
  nickname: {
    value: string
    error: boolean
  }
}

const Signup = () => {
  const [steps, setSteps] = useState<Steps>('emailAndPassword')
  const [registraion, setRegistration] = useState<Registration>({
    email: '',
    password: '',
    termsOfService: false,
    privacyPolicy: false,
    nickname: { value: '', error: false },
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

  const handleRegistration = (registraion: Partial<Registration>) => {
    setRegistration((prev) => ({
      ...prev,
      ...registraion,
    }))
  }

  // 회원가입 완료하는 페이지에서 가져오는 데이터는 직접 받아와야 함
  const completeRegistration = async (nickname: Registration['nickname']['value']) => {
    const { email, password } = registraion

    // @TODO: brithYear, gender, favoriteCategories 실제 데이터로 교체
    await signup({
      variables: {
        email,
        password,
        nickname,
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

    const isValidStep = steps && STEPS.includes(steps)

    if (!isValidStep) {
      return
    }

    setSteps(steps)
  }, [searchParams])

  return (
    <BasicLayout hasBackButton>
      <div className="h-[90vh] py-9 px-5">
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
