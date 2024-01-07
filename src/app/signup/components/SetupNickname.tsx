import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Cancel } from '@/components/common/icons'
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
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void
  completeRegistration: () => void
}) => {
  const isValidLength = (nickname: Nickname) =>
    nickname.length >= MIN_NICKNAME_LENGTH && nickname.length <= MAX_NICKNAME_LENGTH

  const isValidNoBlank = (nickname: Nickname) => !nickname.includes(' ')

  const isValidNickname = (nickname: Nickname) =>
    isValidLength(nickname) && isValidNoBlank(nickname)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const error = isValidNickname(value) ? false : true

    handleRegistration((prev) => ({ ...prev, nickname: { ...prev.nickname, value, error } }))
  }

  const handleInputFocus = () => {
    handleRegistration((prev) => ({ ...prev, nickname: { ...prev.nickname, focus: true } }))
  }

  const handleInputBlur = () => {
    handleRegistration((prev) => ({ ...prev, nickname: { ...prev.nickname, focus: false } }))
  }

  const resetNickname = () => {
    handleRegistration(() => ({ nickname: { value: '', error: false, focus: false } }))
  }

  const handleCTAButton = () => {
    completeRegistration()
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
              value={registration.nickname.value}
              icon={
                registration.nickname.focus ? (
                  <Cancel id="cancel" onMouseDown={resetNickname} />
                ) : (
                  ''
                )
              }
              error={registration.nickname.error && '공백없이 5~20자로 입력해주세요.'}
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
        disabled={!isValidNickname(registration.nickname.value)}
        className="self-end"
      >
        가입완료
      </Button>
    </div>
  )
}

export default SetupNickname
