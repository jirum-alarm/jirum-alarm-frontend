import { useState } from 'react';

import { useUpdatePassword } from '@features/mypage/model/update-password';

const validate = (value: string) => {
  if (value === '') {
    return { error: false, invalidType: false, invalidLength: false };
  }

  const isAlphabet = /[a-zA-Z]/.test(value);
  const isNumber = /\d/.test(value);
  const isSpecialCharacter = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value);

  const isValidType = [isAlphabet, isNumber, isSpecialCharacter].filter(Boolean).length >= 2;
  const isValidLength = /^(.{8,30})$/.test(value);

  return {
    error: !isValidType || !isValidLength,
    invalidType: !isValidType,
    invalidLength: !isValidLength,
  };
};

const useChangePasswordFormViewModel = () => {
  const { mutate: updatePassword } = useUpdatePassword();

  const [input, setInput] = useState({
    password: {
      value: '',
      error: false,
      invalidType: false,
      invalidLength: false,
    },
    confirmPassword: { value: '', error: false },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.currentTarget;
    const error = validate(value);
    setInput((input) => ({
      ...input,
      [id]: { value, ...(id === 'password' ? error : { error: false }) },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { password, confirmPassword } = input;

    if (password.value === confirmPassword.value) {
      updatePassword({ password: input.password.value });
    } else {
      setInput((input) => ({
        ...input,
        confirmPassword: { value: input.confirmPassword.value, error: true },
      }));
    }
  };

  return { handleSubmit, input, handleInputChange };
};

export default useChangePasswordFormViewModel;
