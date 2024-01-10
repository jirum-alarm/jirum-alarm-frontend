'use client'
import Input from '@/components/common/Input'
import useNicknameFormViewModel from '../hooks/useNicknameFormViewModel'
import { Cancel } from '@/components/common/icons'
import Button from '@/components/common/Button'

const NickNameForm = () => {
  const { nickname, handleSubmit, handleInputChange, reset, isValidInput } =
    useNicknameFormViewModel()
  return (
    <form className="flex-1 flex flex-col justify-between pt-[88px]" onSubmit={handleSubmit}>
      <Input
        type="text"
        name="nickname"
        placeholder="닉네임을 입력해주세요."
        onChange={handleInputChange}
        value={nickname.value}
        autoFocus
        icon={
          !!nickname.value && (
            <button type="reset" onClick={reset}>
              <Cancel />
            </button>
          )
        }
        error={nickname.error && '공백없이 2~12자로 입력해주세요.'}
        helperText="공백없이 2~12자로 입력해주세요."
      />
      <Button type="submit" disabled={!isValidInput}>
        저장
      </Button>
    </form>
  )
}

export default NickNameForm
