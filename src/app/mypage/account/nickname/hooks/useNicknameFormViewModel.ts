import { useToast } from '@/components/common/Toast'
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth'
import useGoBack from '@/hooks/useGoBack'
import { useApiQuery } from '@/hooks/useGql'
import { User } from '@/types/user'
import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

const useInput = () => {
  const { data } = useApiQuery<{ me: Omit<User, 'favoriteCategories' | 'linkedSocialProviders'> }>(
    QueryMe,
  )
  const [nickname, setNickname] = useState(() => ({
    value: '',
    error: false,
  }))
  const { showToast } = useToast()
  const goBack = useGoBack()
  const [updateProfile] = useMutation<{ updateUserProfile: boolean }, { nickname: string }>(
    MutationUpdateUserProfile,
    {
      onCompleted: () => {
        showToast('닉네임이 저장됐어요')
        // goBack()
      },
      onError: () => {
        showToast('닉네임이 저장중 에러가 발생했어요')
      },
    },
  )

  useEffect(() => {
    if (data?.me) {
      setNickname((prev) => ({ ...prev, value: data.me.nickname }))
    }
  }, [data])

  const isValidNickname = (value: string) => {
    if (value === '') return true
    const nicknameRegex = /^\S{2,12}$/
    return nicknameRegex.test(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    const error = !isValidNickname(value)

    setNickname(() => ({ value, error }))
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateProfile({ variables: { nickname: nickname.value } })
  }

  const reset = () => {
    setNickname(() => ({ value: '', error: false }))
  }

  const isValidInput = !!nickname.value && !nickname.error
  return { nickname, handleSubmit, handleInputChange, reset, isValidInput }
}

export default useInput
