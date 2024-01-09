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
    validate: (value: string) => boolean,
  ) => {
    const { id, value } = e.target
    const error = validate(value) ? false : true

    if (id === 'password') {
      handleRegistration((prev) => ({ [id]: { ...prev[id], value, error } }))
    }
  }

  const handleInputFocus = () => {
    handleRegistration((prev) => ({ password: { ...prev['password'], focus: true } }))
  }

  const handleInputBlur = () => {
    handleRegistration((prev) => ({ password: { ...prev['password'], focus: false } }))
  }

  const reset = () => {
    handleRegistration(() => ({ password: { value: '', error: false, focus: false } }))
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
    validate: (value: string) => boolean,
  ) => void
  handleInputFocus: () => void
  handleInputBlur: () => void
  reset: () => void
}) => {
  const validate = (value: string) => {
    if (value === '') {
      return true
    }

    const alphabetRegex = /[a-zA-Z]/
    const numberRegex = /\d/
    const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/

    const containsAlphabet = alphabetRegex.test(value)
    const containsNumber = numberRegex.test(value)
    const containsSpecialCharacter = specialCharacterRegex.test(value)

    const conditionsMet = [containsAlphabet, containsNumber, containsSpecialCharacter].filter(
      Boolean,
    ).length

    return conditionsMet >= 2
  }

  return (
    <label>
      <Input
        type="password"
        id="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력해주세요."
        required
        value={registration.password.value}
        icon={registration.password.focus ? <Cancel onMouseDown={reset} /> : ''}
        error={registration.password.error && '영문, 숫자, 특수문자 중 2개 이상 조합해주세요.'}
        onChange={(e) => handleInputChange(e, validate)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </label>
  )
}
