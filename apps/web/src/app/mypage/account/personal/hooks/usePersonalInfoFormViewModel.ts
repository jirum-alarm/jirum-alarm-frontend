import { useToast } from '@/components/common/Toast';
import { BIRTH_YEAR } from '@/constants/birthYear';
import { authQueries } from '@/entities/auth/auth.queries';
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth';
import useGoBack from '@/hooks/useGoBack';
import { User } from '@/types/user';
import { shallowEqual } from '@/util/object';
import { useMutation } from '@apollo/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const _BIRTH_YEAR = BIRTH_YEAR.map((year) => ({ text: String(year), value: String(year) }));
const birthYearOptions = [{ text: '선택안함', value: null }, ..._BIRTH_YEAR];

const usePersonalInfoFormViewModel = () => {
  const [birthYear, setBirthYear] = useState<string | null>();
  const [gender, setGender] = useState<User['gender'] | null>();
  const [originalInfo, setOriginalInfo] = useState<{
    birthYear?: string | null;
    gender?: User['gender'] | null;
  }>();

  const {
    data: { me },
  } = useSuspenseQuery(authQueries.me());

  const { toast } = useToast();
  const goBack = useGoBack();
  const [updateProfile] = useMutation<
    { updateUserProfile: boolean },
    { birthYear: number | null; gender: User['gender'] | null }
  >(MutationUpdateUserProfile, {
    refetchQueries: [{ query: QueryMe }],
    onCompleted: () => {
      toast('개인정보가 저장됐어요.');
      goBack();
    },
    onError: () => {
      toast('개인정보 저장중 에러가 발생했어요.');
    },
  });

  useEffect(() => {
    if (me) {
      const _birthYear = me.birthYear ? String(me.birthYear) : null;
      const _gender = me.gender;
      setBirthYear(_birthYear);
      setGender(_gender);
      setOriginalInfo({ birthYear: _birthYear, gender: _gender });
    }
  }, [me]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const _birthYear = birthYear ? Number(birthYear) : null;
    updateProfile({ variables: { birthYear: _birthYear, gender } });
  };
  const handleSelectChange = (value?: string | null) => {
    setBirthYear(value);
  };
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (gender === value) {
      setGender(null);
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
    birthYearOptions,
  };
};

export default usePersonalInfoFormViewModel;
