import { useToast } from '@/components/common/Toast';
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth';
import useGoBack from '@/hooks/useGoBack';
import { User } from '@/types/user';
import { useMutation } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useEffect, useState } from 'react';

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

const useInput = () => {
  const { data } = useQuery<{ me: Omit<User, 'favoriteCategories' | 'linkedSocialProviders'> }>(
    QueryMe,
  );
  const [nickname, setNickname] = useState(() => ({
    value: '',
    error: false,
  }));
  const { toast } = useToast();
  const goBack = useGoBack();
  const [updateProfile] = useMutation<{ updateUserProfile: boolean }, { nickname: string }>(
    MutationUpdateUserProfile,
    {
      refetchQueries: [{ query: QueryMe }],
      onCompleted: () => {
        toast('닉네임이 저장됐어요');
        goBack();
      },
      onError: () => {
        toast('닉네임이 저장중 에러가 발생했어요');
      },
    },
  );

  useEffect(() => {
    if (data?.me) {
      setNickname((prev) => ({ ...prev, value: data.me.nickname }));
    }
  }, [data]);

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
    updateProfile({ variables: { nickname: nickname.value } });
  };

  const reset = () => {
    setNickname(() => ({ value: '', error: false }));
  };

  const isValidInput = !!nickname.value && !nickname.error;
  return { nickname, handleSubmit, handleInputChange, reset, isValidInput };
};

export default useInput;
