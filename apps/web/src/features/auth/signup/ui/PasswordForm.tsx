import { useState } from 'react';

import { Registration } from '@/app/(mobile)/signup/page';

import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/Button';
import { Eye, EyeOff } from '@/shared/ui/icons';
import Input from '@/shared/ui/Input';

import usePasswordFormViewModel from '@/features/auth/signup/model/usePasswordFormViewModel';

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
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-22">
      <PasswordInput
        value={value}
        isInvalidType={isInvalidType}
        isInvalidLength={isInvalidLength}
        handleInputChange={handleInputChange}
      />
      <div className="h-32" />
      <div className="fixed right-0 bottom-0 left-0 m-auto w-full max-w-[600px] bg-white px-5 pt-3 pb-9">
        <Button type="submit" disabled={!isValidInput}>
          다음
        </Button>
      </div>
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
            <EyeOff onClick={toggleMasking} className="cursor-pointer" />
          ) : (
            <Eye onClick={toggleMasking} className="cursor-pointer" />
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
    <ul className="list-disc pt-2 pl-4">
      <li
        className={cn(
          'transition-colors',
          value && !isInvalidLength && 'text-primary-600',
          isInvalidLength && 'text-error-500',
        )}
      >
        8자 이상 30자 이하 입력
      </li>
      <li
        className={cn(
          'transition-colors',
          value && !isInvalidType && 'text-primary-600',
          isInvalidType && 'text-error-500',
        )}
      >
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
};
