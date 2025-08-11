import { useState } from 'react';

import { useFcmPermission } from '@/lib/firebase/useFcmPermission';

import { useUpdateKeyword } from '../../features';

const MAX_KETWORD_LENGTH = 20;

export const useKeywordInput = () => {
  const { requestPermission } = useFcmPermission();
  const [keyword, setKeyword] = useState({
    error: false,
    value: '',
  });
  const { mutate: addNotificationKeyword } = useUpdateKeyword();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const error = !isValidKeyword(value);
    setKeyword(() => ({ value, error }));
  };
  const isValidKeyword = (value: string) => {
    const valueLength = [...new Intl.Segmenter().segment(value)].length;
    const isValidLength = valueLength > 0 && valueLength <= MAX_KETWORD_LENGTH;

    return isValidLength;
  };
  const reset = () => {
    setKeyword({ error: false, value: '' });
  };
  const canSubmit = !!keyword.value && !keyword.error;
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addNotificationKeyword({ keyword: keyword.value });
    requestPermission();
    reset();
  };
  return { handleInputChange, keyword, reset, handleSubmit, canSubmit };
};
