import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Registration } from '../page'
import { Cancel } from '@/components/common/icons'

const Password = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration
  handleRegistration: (password: (registration: Registration) => Partial<Registration>) => void
  moveNextStep: () => void
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => { error: boolean; invalidType: boolean; invalidLength: boolean },
  ) => {
    const { id, value } = e.target
    const error = validate(value)

    if (id === 'password') {
      handleRegistration((prev) => ({
        [id]: { ...prev[id], value, ...error },
      }))
    }
  }

  const handleInputFocus = () => {
    handleRegistration((prev) => ({ password: { ...prev['password'], focus: true } }))
  }

  const handleInputBlur = () => {
    handleRegistration((prev) => ({ password: { ...prev['password'], focus: false } }))
  }

  const reset = () => {
    handleRegistration(() => ({
      password: { value: '', error: false, invalidType: false, invalidLength: false, focus: false },
    }))
  }

  const handleCTAButton = () => {
    moveNextStep()
  }

  const isValidInput = !!(registration.password.value && !registration.password.error)

  return (
    <div className="grid h-full">
      <div>
        <Description />
        <div className="grid items-end">
          <form className="grid gap-y-8 pt-[88px]">
            <PasswordInput
              registration={registration}
              handleInputChange={handleInputChange}
              handleInputFocus={handleInputFocus}
              handleInputBlur={handleInputBlur}
              reset={reset}
            />
          </form>
        </div>
      </div>
      <Button onClick={handleCTAButton} disabled={!isValidInput} className="self-end">
        다음
      </Button>
    </div>
  )
}

export default Password

const Description = () => {
  return (
    <p className="font-semibold text-2xl">
      비밀번호를
      <br />
      입력해주세요.
    </p>
  )
}

const PasswordInput = ({
  registration,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  reset,
}: {
  registration: Registration
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => { error: boolean; invalidType: boolean; invalidLength: boolean },
  ) => void
  handleInputFocus: () => void
  handleInputBlur: () => void
  reset: () => void
}) => {
  const validate = (value: string) => {
    if (value === '') {
      return { error: false, invalidType: false, invalidLength: false }
    }

    const isAlphabet = /[a-zA-Z]/.test(value)
    const isNumber = /\d/.test(value)
    const isSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value)

    const isValidType = [isAlphabet, isNumber, isSpecialCharacter].filter(Boolean).length >= 2
    const isValidLength = /^(.{8,30})$/.test(value)

    return {
      error: !isValidType || !isValidLength,
      invalidType: !isValidType,
      invalidLength: !isValidLength,
    }
  }

  return (
    <label>
      <Input
        type="password"
        id="password"
        autoComplete="new-password"
        placeholder="비밀번호를 입력해주세요."
        required
        value={registration.password.value}
        icon={registration.password.focus ? <Cancel onMouseDown={reset} /> : ''}
        error={<ErrorText registration={registration} />}
        helperText={<HelperText />}
        onChange={(e) => handleInputChange(e, validate)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </label>
  )
}

function ErrorText({ registration }: { registration: Registration }) {
  if (registration.password.invalidType && registration.password.invalidLength) {
    return (
      <>
        영어, 숫자, 특수문자 중에서 2가지 이상 사용해주세요.
        <br /> 8자 이상 30자 이하로 사용해주세요.
      </>
    )
  }

  if (registration.password.invalidType) {
    return <>영어, 숫자, 특수문자 중에서 2가지 이상 사용해주세요.</>
  }

  if (registration.password.invalidLength) {
    return <>8자 이상 30자 이하로 사용해주세요.</>
  }
}

function HelperText() {
  return (
    <p className="pt-2">
      영어, 숫자, 특수문자 중에서 2가지 이상 사용해주세요.
      <br /> 8자 이상 30자 이하로 사용해주세요.
    </p>
  )
}
