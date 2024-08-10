import { AuthQueries } from '@/entities/auth/auth.queries';
import { AuthService } from '@/shared/api/auth';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

const useCurrentPasswordFormViewModel = ({ nextStep }: { nextStep: () => void }) => {
  const [currentPassword, setCurrentPassword] = useState({
    value: '',
    error: false,
  });

  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());

  // @FIXME: change to password check api
  const { mutate: login } = useMutation({
    mutationFn: AuthService.loginUser,
    onSuccess: () => {
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
      email: me.email ?? '',
      password: currentPassword.value,
    });
  };
  return { handleSubmit, currentPassword, handleCurrentPasswordChange };
};

export default useCurrentPasswordFormViewModel;
