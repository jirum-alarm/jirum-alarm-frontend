import { useState } from 'react';

import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';

import { useUpdateKeyword } from './update-keyword';

const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORD_LENGTH = 20;

export const useKeywordInput = () => {
  const promptPushChannel = usePushChannelPrompt();
  const [keyword, setKeyword] = useState({
    error: false,
    value: '',
  });
  const { mutate: addNotificationKeyword, isPending } = useUpdateKeyword({
    onSuccess: ({ keyword }) => {
      reset();
      promptPushChannel(keyword);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const error = !isValidKeyword(value);
    setKeyword(() => ({ value, error }));
  };
  const isValidKeyword = (value: string) => {
    const valueLength = [...new Intl.Segmenter().segment(value.trim())].length;
    const isValidLength = valueLength >= MIN_KEYWORD_LENGTH && valueLength <= MAX_KEYWORD_LENGTH;

    return isValidLength;
  };
  const reset = () => {
    setKeyword({ error: false, value: '' });
  };
  const canSubmit = !!keyword.value && !keyword.error && !isPending;
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    addNotificationKeyword({ keyword: keyword.value.trim() });
  };
  return { handleInputChange, keyword, reset, handleSubmit, canSubmit };
};
