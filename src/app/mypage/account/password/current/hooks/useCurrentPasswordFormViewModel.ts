import { MutationLogin, QueryMe } from '@/graphql/auth';
import { ILoginVariable } from '@/types/login';
import { User } from '@/types/user';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

const useCurrentPasswordFormViewModel = ({ nextStep }: { nextStep: () => void }) => {
  const [currentPassword, setCurrentPassword] = useState({
    value: '',
    error: false,
  });

  const { data: { me } = {} } = useQuery<{ me: User }>(QueryMe);
  // @FIXME: change to password check api
  const [login] = useMutation<unknown, ILoginVariable>(MutationLogin, {
    onCompleted: () => {
      nextStep();
    },
    onError: () => {
      setCurrentPassword((prev) => ({ ...prev, error: true }));
    },
  });

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  return { handleSubmit, currentPassword, handleCurrentPasswordChange };
};

export default useCurrentPasswordFormViewModel;
