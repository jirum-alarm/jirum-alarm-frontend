'use client';

import { useState } from 'react';

import { Eye, EyeOff } from '@/shared/ui/icons';
import Input from '@/shared/ui/Input';

interface PasswordInputProps {
  autoFocus?: boolean;
  value: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: React.ReactNode;
  labelText: string;
  placeholder: string;
  id?: string;
}

const PasswordInput = ({
  autoFocus = false,
  value,
  handleInputChange,
  helperText,
  labelText,
  placeholder,
  id = 'password',
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
        autoComplete="new-password"
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
