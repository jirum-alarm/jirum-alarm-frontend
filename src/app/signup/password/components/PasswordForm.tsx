import { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Eye, EyeOff } from '@/components/common/icons';
import { Registration } from '../../page';
import usePasswordFormViewModel from '../hooks/usePasswordFormViewModel';
import { cn } from '@/lib/cn';

const PasswordForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (password: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const {
    value,
    error,
    isInvalidType,
    isInvalidLength,
    isValidInput,
    handleInputChange,
    handleSubmit,
  } = usePasswordFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between pt-[88px]">
      <PasswordInput
        value={value}
        error={error}
        isInvalidType={isInvalidType}
        isInvalidLength={isInvalidLength}
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
  value,
  error,
  isInvalidType,
  isInvalidLength,
  isValidInput,
  handleInputChange,
}: {
  value: string;
  error: boolean;
  isInvalidType: boolean;
  isInvalidLength: boolean;
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
        value={value}
        icon={
          !masking ? (
            <EyeOff onClick={toggleMasking} className="cursor-pointer" />
          ) : (
            <Eye onClick={toggleMasking} className="cursor-pointer" />
          )
        }
        error={
          error && <ErrorText isInvalidType={isInvalidType} isInvalidLength={isInvalidLength} />
        }
        helperText={<HelperText isValidInput={isValidInput} />}
        onChange={handleInputChange}
      />
    </label>
  );
};

function ErrorText({
  isInvalidType,
  isInvalidLength,
}: {
  isInvalidType: boolean;
  isInvalidLength: boolean;
}) {
  return (
    <ul className="list-disc pl-8 pt-2">
      <li className={cn(!isInvalidLength && 'text-primary-600')}>8자 이상 입력</li>
      <li className={cn(!isInvalidType && 'text-primary-600')}>
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
}

function HelperText({ isValidInput }: { isValidInput: boolean }) {
  return (
    <ul className="list-disc pl-8 pt-2">
      <li className={cn(isValidInput && 'text-primary-600')}>8자 이상 입력</li>
      <li className={cn(isValidInput && 'text-primary-600')}>
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
}
