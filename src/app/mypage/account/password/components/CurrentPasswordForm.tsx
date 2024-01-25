'use client';
import PasswordInput from './PasswordInput';
import { useState } from 'react';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';

const STEPS = [''];
interface CurrentPasswordFormProps {
  nextStep: () => void;
}

const CurrentPasswordForm = ({ nextStep }: CurrentPasswordFormProps) => {
  const [currentPassword, setCurrentPassword] = useState('');

  const handleCurrentPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setCurrentPassword(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    nextStep();
  };
  return (
    <div className="flex h-full flex-col px-5 pb-9 pt-9">
      <p className="text-2xl font-semibold text-gray-900">
        확인을 위해 현재 비밀번호를
        <br />
        입력해주세요.
      </p>
      <form className="flex flex-1 flex-col justify-between pt-22" onSubmit={handleSubmit}>
        <PasswordInput
          labelText="현재 비밀번호"
          placeholder="비밀번호를 입력해주세요."
          value={currentPassword}
          handleInputChange={handleCurrentPassword}
        />
        <Button type="submit">다음</Button>
      </form>
    </div>
  );
};

export default CurrentPasswordForm;
