import { useUpdateNickname } from '@/app/mypage/features';
import { AuthQueries } from '@/entities/auth/auth.queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

const useInput = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());
  const [nickname, setNickname] = useState(() => ({
    value: '',
    error: false,
  }));
  const { mutate } = useUpdateNickname();

  useEffect(() => {
    if (me) {
      setNickname((prev) => ({ ...prev, value: me.nickname }));
    }
  }, [me]);

  const isValidNickname = (value: string) => {
    const valueLength = [...new Intl.Segmenter().segment(value)].length;
    const isValidLength = valueLength >= MIN_NICKNAME_LENGTH && valueLength <= MAX_NICKNAME_LENGTH;
    const isValidNoBlank = !value.includes(' ');

    return isValidLength && isValidNoBlank;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const error = !isValidNickname(value);

    setNickname(() => ({ value, error }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ nickname: nickname.value });
  };

  const reset = () => {
    setNickname(() => ({ value: '', error: false }));
  };

  const isValidInput = !!nickname.value && !nickname.error;
  return { nickname, handleSubmit, handleInputChange, reset, isValidInput };
};

export default useInput;
