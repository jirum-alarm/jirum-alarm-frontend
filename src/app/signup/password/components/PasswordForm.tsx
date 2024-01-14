import { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Eye, EyeOff } from '@/components/common/icons';
import { Registration } from '../../page';
import usePasswordFormViewModel from '../hooks/usePasswordFormViewModel';

const PasswordForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (password: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const { isValidInput, handleInputChange, handleSubmit } = usePasswordFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between pt-[88px]">
      <PasswordInput
        registration={registration}
        isValidInput={isValidInput}
        handleInputChange={handleInputChange}
      />
      <Button type="submit" disabled={!isValidInput}>
        다음
      </Button>
    </form>
  );
};

export default PasswordForm;

const PasswordInput = ({
  registration,
  isValidInput,
  handleInputChange,
}: {
  registration: Registration;
  isValidInput: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [masking, setMasking] = useState(true);

  const toggleMasking = () => {
    setMasking((prev) => !prev);
  };

  return (
    <label>
      <Input
        type={masking ? 'password' : 'text'}
        id="password"
        autoComplete="new-password"
        placeholder="비밀번호를 입력해주세요."
        required
        value={registration.password.value}
        icon={masking ? <EyeOff onClick={toggleMasking} /> : <Eye onClick={toggleMasking} />}
        error={
          registration.password.error && (
            <p className="pt-2">
              <ErrorText registration={registration} />
            </p>
          )
        }
        helperText={
          !isValidInput && (
            <p className="pt-2">
              <HelperText />
            </p>
          )
        }
        onChange={handleInputChange}
      />
    </label>
  );
};

function ErrorText({ registration }: { registration: Registration }) {
  if (registration.password.invalidType && registration.password.invalidLength) {
    return (
      <>
        영어, 숫자, 특수문자 중에서 2가지 이상 사용해주세요.
        <br /> 8자 이상 30자 이하로 사용해주세요.
      </>
    );
  }

  if (registration.password.invalidType) {
    return <>영어, 숫자, 특수문자 중에서 2가지 이상 사용해주세요.</>;
  }

  if (registration.password.invalidLength) {
    return <>8자 이상 30자 이하로 사용해주세요.</>;
  }
}

function HelperText() {
  return (
    <>
      영어, 숫자, 특수문자 중에서 2가지 이상 사용해주세요.
      <br /> 8자 이상 30자 이하로 사용해주세요.
    </>
  );
}
