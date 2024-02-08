'use client';

import Button from '@/components/common/Button';
import { cn } from '@/lib/cn';
import Input from '@/components/common/Input';
import { Cancel, Eye, EyeOff } from '@/components/common/icons';
import useEmailLoginFormViewModel from '../hooks/useEmailLoginFormViewModel';
import { useState } from 'react';

const EmailLoginForm = () => {
  const { email, password, error, handleSubmit } = useEmailLoginFormViewModel();

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-11">
      <EmailInput email={email} />
      <PasswordInput password={password} />
      <div className="h-32" />
      <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[480px] bg-white px-5 pb-9 pt-3">
        {error && (
          <p className="pb-4 text-center text-sm text-error-500">
            이메일 혹은 비밀번호가 올바르지 않아요.
          </p>
        )}
        <Button type="submit" disabled={!true}>
          로그인
        </Button>
      </div>
    </form>
  );
};

export default EmailLoginForm;

const EmailInput = ({
  email,
}: {
  email: ReturnType<typeof useEmailLoginFormViewModel>['email'];
}) => {
  return (
    <>
      <label htmlFor="email" className="pb-2 text-sm text-gray-500">
        이메일
      </label>
      <Input
        type="email"
        id="email"
        autoComplete="email"
        placeholder="이메일을 입력해주세요."
        required
        value={email.value}
        icon={email.focus ? <Cancel onMouseDown={email.reset} /> : ''}
        error={email.error && '올바른 이메일 형식으로 입력해주세요.'}
        onChange={email.handleInputChange}
        onFocus={email.handleInputFocus}
        onBlur={email.handleInputBlur}
      />
    </>
  );
};

const PasswordInput = ({
  password,
}: {
  password: ReturnType<typeof useEmailLoginFormViewModel>['password'];
}) => {
  const [masking, setMasking] = useState(true);

  const toggleMasking = () => {
    setMasking((prev) => !prev);
  };

  return (
    <>
      <label htmlFor="password" className="pb-2 pt-11 text-sm text-gray-500">
        비밀번호
      </label>
      <Input
        type={masking ? 'password' : 'text'}
        id="password"
        autoComplete="new-password"
        placeholder="비밀번호를 입력해주세요."
        required
        value={password.value}
        icon={
          masking ? (
            <Eye onClick={toggleMasking} className="cursor-pointer text-gray-400" />
          ) : (
            <EyeOff onClick={toggleMasking} className="cursor-pointer" />
          )
        }
        helperText={
          password.value && (
            <HelperText
              value={password.value}
              isInvalidType={password.isInvalidType}
              isInvalidLength={password.isInvalidLength}
            />
          )
        }
        onChange={password.handleInputChange}
      />
    </>
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
    <ul className="list-disc pl-4 pt-2">
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
