import { useToast } from '@/components/common/Toast';
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth';
import useGoBack from '@/hooks/useGoBack';
import { User } from '@/types/user';
import { shallowEqual } from '@/util/object';
import { useMutation } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useEffect, useState } from 'react';

const usePersonalInfoFormViewModel = () => {
  const [birthYear, setBirthYear] = useState<string | undefined>();
  const [gender, setGender] = useState<User['gender'] | undefined>();
  const [originalInfo, setOriginalInfo] = useState<{
    birthYear?: string;
    gender?: User['gender'];
  }>();

  const { data } = useQuery<{ me: Omit<User, 'favoriteCategories' | 'linkedSocialProviders'> }>(
    QueryMe,
  );
  const { showToast } = useToast();
  const goBack = useGoBack();
  const [updateProfile] = useMutation<
    { updateUserProfile: boolean },
    { birthYear: number | undefined; gender: User['gender'] }
  >(MutationUpdateUserProfile, {
    onCompleted: () => {
      // showToast('개인정보가 저장됐어요')
      goBack();
    },
    onError: () => {
      // showToast('개인정보 저장중 에러가 발생했어요')
    },
  });

  useEffect(() => {
    if (data?.me) {
      const _birthYear = String(data.me.birthYear);
      const _gender = data.me.gender;
      setBirthYear(_birthYear);
      setGender(_gender);
      setOriginalInfo({ birthYear: _birthYear, gender: _gender });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const _birthYear = isNaN(Number(birthYear)) ? undefined : Number(birthYear);
    updateProfile({ variables: { birthYear: _birthYear, gender } });
  };
  const handleSelectChange = (value: string) => {
    setBirthYear(value);
  };
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (gender === value) {
      setGender(undefined);
    } else {
      setGender(value as User['gender']);
    }
  };

  const isValidPersonalInfoInput = () => {
    if (!originalInfo) return false;
    return shallowEqual(originalInfo, {
      birthYear,
      gender,
    });
  };
  return {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    isValidPersonalInfoInput,
  };
};

export default usePersonalInfoFormViewModel;
