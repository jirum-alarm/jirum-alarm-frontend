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
  const { value, isInvalidType, isInvalidLength, isValidInput, handleInputChange, handleSubmit } =
    usePasswordFormViewModel({
      registration,
      handleRegistration,
      moveNextStep,
    });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between pt-[88px]">
      <PasswordInput
        value={value}
        isInvalidType={isInvalidType}
        isInvalidLength={isInvalidLength}
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
  isInvalidType,
  isInvalidLength,
  handleInputChange,
}: {
  value: string;
  isInvalidType: boolean;
  isInvalidLength: boolean;
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
          masking ? (
            <Eye onClick={toggleMasking} className="cursor-pointer" />
          ) : (
            <EyeOff onClick={toggleMasking} className="cursor-pointer" />
          )
        }
        /** @MEMO 헬퍼 텍스트에서 조건에 맞거나 틀린 경우 색을 바꾸는 형태라 errorText를 의도적으로 사용하지 않았음
         * */
        helperText={
          <HelperText
            value={value}
            isInvalidType={isInvalidType}
            isInvalidLength={isInvalidLength}
          />
        }
        onChange={handleInputChange}
      />
    </label>
  );
};

const HelperText = ({
  value,
  isInvalidType,
  isInvalidLength,
}: {
  value: string;
  isInvalidType: boolean;
  isInvalidLength: boolean;
}) => {
  return (
    <ul className="list-disc pl-8 pt-2">
      <li
        className={cn(
          'transition-colors',
          value && !isInvalidLength && 'text-primary-600',
          isInvalidLength && 'text-error',
        )}
      >
        8자 이상 30자 이하 입력
      </li>
      <li
        className={cn(
          'transition-colors',
          value && !isInvalidType && 'text-primary-600',
          isInvalidType && 'text-error',
        )}
      >
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
};