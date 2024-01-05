'use client'

import { useState } from 'react'
import BasicLayout from '@/components/layout/BasicLayout'
import RegisterByEmail from './components/RegisterByEmail'
import AgreeTermsOfService from './components/AgreeTermsOfService'
import SetupNickname from './components/SetupNickname'
import { useMutation } from '@apollo/client'
import { MutationSignup } from '@/graphql/auth'
import { ISignupVariable, ISignupOutput } from '@/graphql/interface/auth'
import Completed from './components/Completed'
import { StorageTokenKey } from '@/types/enum/auth'

type Step = 'emailAndPassword' | 'termsOfService' | 'nickname' | 'complete'

export interface Registration {
  email: string
  password: string
  nickname: string
}

const Signup = () => {
  const [steps, setSteps] = useState<Step>('emailAndPassword')
  const [userRegistraion, setUserRegistration] = useState({ email: '', password: '', nickname: '' })

  const [signup] = useMutation<ISignupOutput, ISignupVariable>(MutationSignup, {
    onCompleted: (data) => {
      localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, data.signup.accessToken)

      if (data.signup.refreshToken) {
        localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, data.signup.refreshToken)
      }

      moveNextStep('complete')
    },
  })

  const moveNextStep = (step: Step) => {
    setSteps(step)
  }

  const handleUserRegistration = (registraion: Partial<Registration>) => {
    setUserRegistration((prev) => ({
      ...prev,
      ...registraion,
    }))
  }

  // 회원가입 완료하는 페이지에서 가져오는 데이터는 직접 받아와야 함
  const completeRegistration = async (nickname: Registration['nickname']) => {
    const { email, password } = userRegistraion

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

  return (
    <BasicLayout hasBackButton={steps !== 'complete'}>
      <div className="h-[90vh] py-9 px-5">
        {steps === 'emailAndPassword' && (
          <RegisterByEmail
            handleUserRegistration={handleUserRegistration}
            moveNextStep={() => moveNextStep('termsOfService')}
          />
        )}
        {steps === 'termsOfService' && (
          <AgreeTermsOfService moveNextStep={() => moveNextStep('nickname')} />
        )}
        {steps === 'nickname' && <SetupNickname completeRegistration={completeRegistration} />}
        {steps === 'complete' && <Completed />}
      </div>
    </BasicLayout>
  )
}

export default Signup
