import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { AuthQueries } from '@/entities/auth';

import { useUpdateNickname } from './update-nickname';

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

const useInput = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());
  const [nickname, setNickname] = useState(() => ({
    value: me ? me.nickname : '',
    error: false,
  }));
  const { mutate } = useUpdateNickname();

  // 서버의 내 정보가 새로 오면 입력값을 그 닉네임으로 맞춘다 — effect 대신 렌더 중 비교로.
  const [syncedMe, setSyncedMe] = useState(me);
  if (me !== syncedMe) {
    setSyncedMe(me);
    if (me) setNickname((prev) => ({ ...prev, value: me.nickname }));
  }

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
