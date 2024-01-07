import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Registration } from '../page'
import { Cancel } from '@/components/common/icons'

type Id = 'email' | 'password'

const RegisterByEmail = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration
  handleRegistration: (
    passwordAndEmail: (registration: Registration) => Partial<Registration>,
  ) => void
  moveNextStep: () => void
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => boolean,
  ) => {
    const id = e.target.id
    const value = e.target.value
    const error = validate(value) ? false : true

    if (id === 'email' || id === 'password') {
      handleRegistration((prev) => ({ [id]: { ...prev[id], value, error } }))
    }
  }

  const handleInputFocus = (id: Id) => {
    handleRegistration((prev) => ({ [id]: { ...prev[id], focus: true } }))
  }

  const handleInputBlur = (id: Id) => {
    handleRegistration((prev) => ({ [id]: { ...prev[id], focus: false } }))
  }

  const reset = (id: 'email' | 'password') => {
    handleRegistration(() => ({ [id]: { value: '', error: false, focus: false } }))
  }

  const handleCTAButton = () => {
    moveNextStep()
  }

  const isValidInput = !!(
    registration.email.value &&
    !registration.email.error &&
    registration.password.value &&
    !registration.password.error
  )

  return (
    <div className="grid h-full">
      <div>
        <Description />
        <div className="grid items-end">
          <form className="grid gap-y-8 pt-[88px]">
            <Email
              registration={registration}
              handleInputChange={handleInputChange}
              handleInputFocus={handleInputFocus}
              handleInputBlur={handleInputBlur}
              reset={reset}
            />
            <Password
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

export default RegisterByEmail

const Description = () => {
  return (
    <p className="font-semibold text-2xl">
      이메일과 비밀번호를
      <br />
      입력해주세요.
    </p>
  )
}

const Email = ({
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
  handleInputFocus: (id: Id) => void
  handleInputBlur: (id: Id) => void
  reset: (id: 'email') => void
}) => {
  const id = 'email'

  const validate = (value: string) => {
    if (value === '') {
      return true
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(value)
  }

  return (
    <label>
      <Input
        type="email"
        id="email"
        autoComplete="email"
        placeholder="이메일을 입력해주세요."
        required
        value={registration.email.value}
        icon={registration.email.focus ? <Cancel onMouseDown={() => reset(id)} /> : ''}
        error={registration.email.error && '올바른 이메일 형식으로 입력해주세요.'}
        onChange={(e) => handleInputChange(e, validate)}
        onFocus={() => handleInputFocus(id)}
        onBlur={() => handleInputBlur(id)}
      />
    </label>
  )
}

const Password = ({
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
  handleInputFocus: (id: Id) => void
  handleInputBlur: (id: Id) => void
  reset: (id: 'password') => void
}) => {
  const id = 'password'
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
        icon={registration.password.focus ? <Cancel onMouseDown={() => reset(id)} /> : ''}
        error={registration.password.error && '영문, 숫자, 특수문자 중 2개 이상 조합해주세요.'}
        onChange={(e) => handleInputChange(e, validate)}
        onFocus={() => handleInputFocus(id)}
        onBlur={() => handleInputBlur(id)}
      />
    </label>
  )
}
