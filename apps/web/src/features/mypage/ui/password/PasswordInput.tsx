'use client';

import { useState } from 'react';

import { Eye, EyeOff } from '@/shared/ui/common/icons';
import Input from '@/shared/ui/common/Input';

interface PasswordInputProps {
  autoFocus?: boolean;
  value: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: React.ReactNode;
  labelText: string;
  placeholder: string;
  id?: string;
  /** 현재 비밀번호 칸은 'current-password' — 'new-password' 면 iOS 가 저장된 값을 채우는 대신 새 비밀번호를 만들어 준다. */
  autoComplete?: 'current-password' | 'new-password';
}

const PasswordInput = ({
  autoFocus = false,
  value,
  handleInputChange,
  helperText,
  labelText,
  placeholder,
  id = 'password',
  autoComplete = 'new-password',
}: PasswordInputProps) => {
  const [masking, setMasking] = useState(true);

  const toggleMasking = () => {
    setMasking((prev) => !prev);
  };

  return (
    <label>
      <span className="text-sm text-gray-500">{labelText}</span>
      <Input
        type={masking ? 'password' : 'text'}
        id={id}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        value={value}
        icon={
          masking ? (
            <EyeOff onClick={toggleMasking} className="cursor-pointer" />
          ) : (
            <Eye onClick={toggleMasking} className="cursor-pointer" />
          )
        }
        helperText={helperText}
        onChange={handleInputChange}
      />
    </label>
  );
};

export default PasswordInput;
