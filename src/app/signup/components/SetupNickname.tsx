import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Cancel } from '@/components/common/icons'
import { useState } from 'react'
import { Registration } from '../page'

const MIN_NICKNAME_LENGTH = 5
const MAX_NICKNAME_LENGTH = 20

type Nickname = Registration['nickname']['value']

const SetupNickname = ({
  registration,
  handleRegistration,
  completeRegistration,
}: {
  registration: Registration
  handleRegistration: (nickname: Pick<Registration, 'nickname'>) => void
  completeRegistration: (nickname: Nickname) => void
}) => {
  const [nickname, setNickname] = useState({
    value: registration.nickname.value,
    error: registration.nickname.error,
    focus: false,
  })

  const isValidLength = (nickname: Nickname) =>
    nickname.length >= MIN_NICKNAME_LENGTH && nickname.length <= MAX_NICKNAME_LENGTH

  const isValidNoBlank = (nickname: Nickname) => !nickname.includes(' ')

  const isValidNickname = (nickname: Nickname) =>
    isValidLength(nickname) && isValidNoBlank(nickname)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('change')
    const value = e.target.value
    const error = isValidNickname(value) ? false : true

    setNickname((prev) => ({ ...prev, value, error }))

    handleRegistration({ nickname: { value, error } })
  }

  const handleInputFocus = () => {
    setNickname((prev) => ({ ...prev, focus: true }))
  }

  const handleInputBlur = () => {
    setNickname((prev) => ({ ...prev, focus: false }))
  }

  const resetNickname = () => {
    setNickname({ value: '', error: false, focus: false })
  }

  const handleCTAButton = () => {
    completeRegistration(nickname.value)
  }

  return (
    <div className="grid h-full">
      <div>
        <p className="font-semibold text-2xl">
          닉네임을
          <br />
          입력해주세요.
        </p>
        <div className="grid pt-[88px] h-full">
          <div>
            <Input
              type="text"
              id="nickname"
              placeholder="닉네임을 입력해주세요."
              value={nickname.value}
              icon={nickname.focus ? <Cancel id="cancel" onMouseDown={resetNickname} /> : ''}
              error={nickname.error && '공백없이 5~20자로 입력해주세요.'}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>
      </div>
      {/** @TODO: 관심사, 성별 페이지 추가 후 버튼명 변경 */}
      <Button
        onClick={handleCTAButton}
        disabled={!isValidNickname(nickname.value)}
        className="self-end"
      >
        가입완료
      </Button>
    </div>
  )
}

export default SetupNickname
