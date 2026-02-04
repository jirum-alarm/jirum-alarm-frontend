'use client';

import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';

import useChangePasswordFormViewModel from '../../model/useChangePasswordFormViewModel';

import PasswordInput from './PasswordInput';

const ChangePasswordForm = () => {
  const { handleInputChange, handleSubmit, input } = useChangePasswordFormViewModel();
  return (
    <form className="flex h-full flex-col justify-between px-5 py-6" onSubmit={handleSubmit}>
      <div>
        <PasswordInput
          autoFocus
          labelText="새 비밀번호"
          id="password"
          placeholder="새 비밀번호를 입력해주세요."
          value={input.password.value}
          helperText={
            <HelperText
              value={input.password.value}
              isInvalidType={input.password.invalidType}
              isInvalidLength={input.password.invalidLength}
            />
          }
          handleInputChange={handleInputChange}
        />
        <div className="h-9" />
        <PasswordInput
          labelText="새 비밀번호 확인"
          id="confirmPassword"
          placeholder="새 비밀번호를 다시 입력해주세요."
          value={input.confirmPassword.value}
          helperText={
            <ConfirmHelperText
              value={input.confirmPassword.value}
              isInValid={input.confirmPassword.error}
            />
          }
          handleInputChange={handleInputChange}
        />
      </div>
      <Button type="submit">저장</Button>
    </form>
  );
};

export default ChangePasswordForm;

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
          !value && 'text-gray-400',
          value && !isInvalidLength && 'text-primary-600',
          isInvalidLength && 'text-error-500',
        )}
      >
        8자 이상 30자 이하 입력
      </li>
      <li
        className={cn(
          'transition-colors',
          !value && 'text-gray-400',
          value && !isInvalidType && 'text-primary-600',
          isInvalidType && 'text-error-500',
        )}
      >
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
};

const ConfirmHelperText = ({ value, isInValid }: { value: string; isInValid: boolean }) => {
  return (
    <>
      {value && isInValid && (
        <p className="text-error-500">새 비밀번호와 일치하지 않아요. 다시 확인해주세요.</p>
      )}
    </>
  );
};
