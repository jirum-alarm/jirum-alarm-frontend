import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Registration } from '../page'

const RegisterByEmail = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration
  handleRegistration: (emailAndPassword: Partial<Pick<Registration, 'email' | 'password'>>) => void
  moveNextStep: () => void
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id
    const value = e.target.value

    if (id === 'email' || id === 'password') {
      handleRegistration({ [id]: value })
    }
  }

  const handleCTAButton = () => {
    moveNextStep()
  }

  // @TODO: 이메일, 패스워드 발리데이션 및 이메일 검증 논의
  return (
    <div className="grid h-full">
      <div className="grid items-end">
        <form className="grid gap-y-8">
          <label>
            <Input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="이메일"
              value={registration.email}
              required
              onChange={handleInputChange}
            />
          </label>
          <label>
            <Input
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              value={registration.password}
              required
              onChange={handleInputChange}
            />
          </label>
        </form>
      </div>
      <Button
        onClick={handleCTAButton}
        disabled={!(registration.email && registration.password)}
        className="self-end"
      >
        다음
      </Button>
    </div>
  )
}

export default RegisterByEmail
