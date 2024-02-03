import { useToast } from '@/components/common/Toast';
import { MutationAddNotificationKeyword, QueryMypageKeyword } from '@/graphql/keyword';
import { useMutation } from '@apollo/client';
import { useState } from 'react';

const MAX_KETWORD_LENGTH = 20;

export const useKeywordInput = () => {
  const [keyword, setKeyword] = useState({
    error: false,
    value: '',
  });
  const { toast } = useToast();
  const [addNotificationKeyword] = useMutation<
    { addNotificationKeyword: boolean },
    { keyword: string }
  >(MutationAddNotificationKeyword, {
    refetchQueries: [{ query: QueryMypageKeyword, variables: { limit: 20 } }],
    onCompleted: () => {},
    onError: (error) => {
      toast(error.message);
    },
  });

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
    addNotificationKeyword({ variables: { keyword: keyword.value } });
    reset();
  };
  return { handleInputChange, keyword, reset, handleSubmit, canSubmit };
};
