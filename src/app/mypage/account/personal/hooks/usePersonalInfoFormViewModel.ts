import { useToast } from '@/components/common/Toast'
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth'
import useGoBack from '@/hooks/useGoBack'
import { User } from '@/types/user'
import { useMutation } from '@apollo/client'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useEffect, useState } from 'react'

const usePersonalInfoFormViewModel = () => {
  const [birthYear, setBirthYear] = useState<string | undefined>()
  const [gender, setGender] = useState<User['gender'] | undefined>()
  const { data } = useQuery<{ me: Omit<User, 'favoriteCategories' | 'linkedSocialProviders'> }>(
    QueryMe,
  )
  const { showToast } = useToast()
  const goBack = useGoBack()
  const [updateProfile] = useMutation<
    { updateUserProfile: boolean },
    { birthYear: number; gender: User['gender'] }
  >(MutationUpdateUserProfile, {
    onCompleted: () => {
      // showToast('개인정보가 저장됐어요')
      goBack()
    },
    onError: () => {
      // showToast('개인정보 저장중 에러가 발생했어요')
    },
  })
  useEffect(() => {
    if (data?.me) {
      setBirthYear(String(data.me.birthYear))
      setGender(data.me.gender)
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (birthYear && gender) {
      updateProfile({ variables: { birthYear: Number(birthYear), gender } })
    }
  }
  const handleSelectChange = (value: string) => {
    setBirthYear(value)
  }
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    setGender(value as User['gender'])
  }

  const isValidPersonalInfoInput = !!birthYear && !!gender
  return {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    isValidPersonalInfoInput,
  }
}

export default usePersonalInfoFormViewModel
