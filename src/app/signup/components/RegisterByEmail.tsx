import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useState } from 'react'
import { Registration } from '../page'

interface EmailAndPassword {
  email: Registration['email']
  password: Registration['password']
}

const RegisterByEmail = ({
  handleUserRegistration,
  moveNextStep,
}: {
  handleUserRegistration: (emailAndPassword: Partial<Registration>) => void
  moveNextStep: () => void
}) => {
  const [emailAndPassword, setEmailAndPassword] = useState<EmailAndPassword>({
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAndPassword((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleCTAButton = () => {
    handleUserRegistration(emailAndPassword)
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
              min={8}
              required
              onChange={handleInputChange}
            />
          </label>
        </form>
      </div>
      <Button
        onClick={handleCTAButton}
        disabled={!(emailAndPassword.email && emailAndPassword.password)}
        className="self-end"
      >
        다음
      </Button>
    </div>
  )
}

export default RegisterByEmail
