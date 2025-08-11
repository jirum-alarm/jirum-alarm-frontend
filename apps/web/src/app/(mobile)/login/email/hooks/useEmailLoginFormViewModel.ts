import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { setAccessToken, setRefreshToken } from '@/app/actions/token';
import { useToast } from '@/components/common/Toast';
import useMyRouter from '@/hooks/useMyRouter';
import { fcmTokenAtom } from '@/state/fcmToken';
import { AuthService } from '@/shared/api/auth/auth.service';

import { WebViewBridge, WebViewEventType } from '@shared/lib/webview';

const HOME_PATH = '/';

interface Input {
  value: string;
  error: boolean;
  focus: boolean;
}

interface Login {
  email: Input;
  password: Input & { invalidType: boolean; invalidLength: boolean };
  error: boolean;
}

const useEmailLoginFormViewModel = () => {
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState<Login>({
    email: {
      value: '',
      error: false,
      focus: false,
    },
    password: {
      value: '',
      error: false,
      focus: false,
      invalidType: false,
      invalidLength: false,
    },
    error: false,
  });

  const router = useMyRouter();

  const { mutate: login } = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: AuthService.loginUser,
    onSuccess: async (data) => {
      await setAccessToken(data.login.accessToken);

      if (data.login.refreshToken) {
        WebViewBridge.sendMessage(WebViewEventType.LOGIN_SUCCESS, {
          data: {
            accessToken: data.login.accessToken,
            refreshToken: data.login.refreshToken,
          },
        });
        await setRefreshToken(data.login.refreshToken);
      }

      toast('로그인에 성공했어요.');
      router.replace(HOME_PATH);
    },
    onError: () => {
      setLoginForm((prev) => ({ ...prev, error: true }));
    },
  });

  const emailValidate = (value: string) => {
    if (value === '') {
      return true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  };

  const emailHandleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const error = emailValidate(value) ? false : true;

    setLoginForm((prev) => ({
      ...prev,
      email: { ...prev.email, value, error },
    }));
  };

  const emailHandleInputFocus = () => {
    setLoginForm((prev) => ({
      ...prev,
      email: { ...prev.email, focus: true },
    }));
  };

  const emailHandleInputBlur = () => {
    setLoginForm((prev) => ({
      ...prev,
      email: { ...prev.email, focus: false },
    }));
  };

  const emailReset = () => {
    setLoginForm((prev) => ({
      ...prev,
      email: { value: '', error: false, focus: false },
    }));
  };

  const passwordValidate = (value: string) => {
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

  const passwordHandleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const error = passwordValidate(value);

    setLoginForm((prev) => ({
      ...prev,
      password: { ...prev.password, value, ...error },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({
        email: loginForm.email.value,
        password: loginForm.password.value,
      },
    });
  };

  return {
    email: {
      value: loginForm.email.value,
      error: loginForm.email.error,
      focus: loginForm.email.focus,
      handleInputChange: emailHandleInputChange,
      handleInputFocus: emailHandleInputFocus,
      handleInputBlur: emailHandleInputBlur,
      reset: emailReset,
    },
    password: {
      value: loginForm.password.value,
      error: loginForm.password.error,
      focus: loginForm.password.focus,
      isInvalidType: loginForm.password.invalidType,
      isInvalidLength: loginForm.password.invalidLength,
      handleInputChange: passwordHandleInputChange,
    },
    error: loginForm.error,
    handleSubmit,
  };
};

export default useEmailLoginFormViewModel;
