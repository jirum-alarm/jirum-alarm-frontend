'use client';
import PasswordInput from './PasswordInput';
import { useState } from 'react';
import Button from '@/components/common/Button';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { User } from '@/types/user';
import { MutationLogin, QueryMe } from '@/graphql/auth';
import { useMutation } from '@apollo/client';
import { ILoginOutput, ILoginVariable } from '@/types/login';

const STEPS = [''];
interface CurrentPasswordFormProps {
  nextStep: () => void;
}

const CurrentPasswordForm = ({ nextStep }: CurrentPasswordFormProps) => {
  const [currentPassword, setCurrentPassword] = useState({
    value: '',
    error: false,
  });

  const { data: { me } = {} } = useQuery<{ me: User }>(QueryMe);
  const [login] = useMutation<ILoginOutput, ILoginVariable>(MutationLogin, {
    onCompleted: (data) => {
      nextStep();
    },
    onError: () => {
      setCurrentPassword((prev) => ({ ...prev, error: true }));
    },
  });

  const handleCurrentPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setCurrentPassword({ value, error: false });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({
      variables: {
        email: me?.email ?? '',
        password: currentPassword.value,
      },
    });
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
          value={currentPassword.value}
          helperText={
            <HelperText value={currentPassword.value} isInValid={currentPassword.error} />
          }
          handleInputChange={handleCurrentPassword}
        />
        <Button type="submit">다음</Button>
      </form>
    </div>
  );
};

export default CurrentPasswordForm;

const HelperText = ({ value, isInValid }: { value: string; isInValid: boolean }) => {
  return <>{value && isInValid && <p className="text-error">올바른 비밀번호를 입력해주세요.</p>}</>;
};
