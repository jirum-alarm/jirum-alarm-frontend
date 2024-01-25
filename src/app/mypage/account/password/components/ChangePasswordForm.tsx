import { useState } from 'react';
import PasswordInput from './PasswordInput';
import Button from '@/components/common/Button';
import { cn } from '@/lib/cn';

const validate = (value: string) => {
  if (value === '') {
    return { error: false, invalidType: false, invalidLength: false };
  }

  const isAlphabet = /[a-zA-Z]/.test(value);
  const isNumber = /\d/.test(value);
  const isSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);

  const isValidType = [isAlphabet, isNumber, isSpecialCharacter].filter(Boolean).length >= 2;
  const isValidLength = /^(.{8,30})$/.test(value);

  return {
    error: !isValidType || !isValidLength,
    invalidType: !isValidType,
    invalidLength: !isValidLength,
  };
};

const ChangePasswordForm = () => {
  const [input, setInput] = useState({
    password: { value: '', error: false, invalidType: false, invalidLength: false },
    confirmPassword: { value: '', error: false },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.currentTarget;
    const error = validate(value);
    setInput((input) => ({ ...input, [id]: { value, ...error } }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log('!!');
    e.preventDefault();
    console.log(input);
  };

  // const isValidInput =

  return (
    <form className="flex h-full flex-col justify-between px-5 py-6" onSubmit={handleSubmit}>
      <div>
        <PasswordInput
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
    <ul className="list-disc pl-4 pt-2">
      <li
        className={cn(
          'transition-colors',
          !value && 'text-gray-400',
          value && !isInvalidLength && 'text-primary-600',
          isInvalidLength && 'text-error',
        )}
      >
        8자 이상 30자 이하 입력
      </li>
      <li
        className={cn(
          'transition-colors',
          !value && 'text-gray-400',
          value && !isInvalidType && 'text-primary-600',
          isInvalidType && 'text-error',
        )}
      >
        영어, 숫자, 특수문자 중 2가지 이상 조합
      </li>
    </ul>
  );
};
