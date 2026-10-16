'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
import { Cancel, Eye, EyeOff } from '@/shared/ui/common/icons';
import Input from '@/shared/ui/common/Input';

import useEmailLoginFormViewModel from '../../model/login/useEmailLoginFormViewModel';

const EmailLoginForm = () => {
  const { email, password, error, handleSubmit } = useEmailLoginFormViewModel();

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between gap-10 pt-11">
      <EmailInput email={email} />
      <PasswordInput password={password} hideHelperText={true} />
      <div className="bg-white py-9">
        {error && (
          <p className="text-error-600 pb-4 text-center text-sm">
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
        autoComplete="username"
        placeholder="이메일을 입력해주세요."
        required
        value={email.value}
        icon={
          email.focus && (
            <button
              type="button"
              aria-label="이메일 지우기"
              onMouseDown={email.reset}
              className="absolute top-[-5px] left-[-5px] cursor-pointer p-2"
            >
              <Cancel />
            </button>
          )
        }
        error={email.error}
        helperText={email.error && '올바른 이메일 형식으로 입력해주세요.'}
        onChange={email.handleInputChange}
        onFocus={email.handleInputFocus}
        onBlur={email.handleInputBlur}
      />
    </>
  );
};

const PasswordInput = ({
  password,
  hideHelperText,
}: {
  password: ReturnType<typeof useEmailLoginFormViewModel>['password'];
  hideHelperText: boolean;
}) => {
  const [masking, setMasking] = useState(true);

  const toggleMasking = () => {
    setMasking((prev) => !prev);
  };

  return (
    <>
      <label htmlFor="password" className="pt-11 pb-2 text-sm text-gray-500">
        비밀번호
      </label>
      <Input
        type={masking ? 'password' : 'text'}
        id="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력해주세요."
        required
        value={password.value}
        icon={
          <button
            type="button"
            onClick={toggleMasking}
            aria-label={masking ? '비밀번호 보기' : '비밀번호 숨기기'}
            className="block cursor-pointer text-gray-500"
          >
            {masking ? <EyeOff /> : <Eye />}
          </button>
        }
        helperText={
          password.value &&
          !hideHelperText && (
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
    <ul className="list-disc pt-2 pl-4">
      <li
        className={cn(
          'transition-colors',
          value && !isInvalidLength && 'text-primary-800',
          isInvalidLength && 'text-error-600',
        )}
      >
        8자 이상 30자 이하 입력
      </li>
      <li
        className={cn(
          'transition-colors',
          value && !isInvalidType && 'text-primary-800',
          isInvalidType && 'text-error-600',
        )}
      >
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
};
