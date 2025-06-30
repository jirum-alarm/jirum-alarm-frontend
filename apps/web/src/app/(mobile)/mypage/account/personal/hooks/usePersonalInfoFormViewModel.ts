import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useUpdatePersonal } from '@/app/(mobile)/mypage/features';
import { BIRTH_YEAR } from '@/constants/birthYear';
import { AuthQueries } from '@/entities/auth';
import { Gender } from '@/shared/api/gql/graphql';
import { shallowEqual } from '@/util/object';

const _BIRTH_YEAR = BIRTH_YEAR.map((year) => ({
  text: String(year),
  value: String(year),
}));
const birthYearOptions = [{ text: '선택안함', value: null }, ..._BIRTH_YEAR];

const usePersonalInfoFormViewModel = () => {
  const [birthYear, setBirthYear] = useState<string | null>();
  const [gender, setGender] = useState<Gender | null>();
  const [originalInfo, setOriginalInfo] = useState<{
    birthYear?: string | null;
    gender?: Gender | null;
  }>();

  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());
  const { mutate: updateProfile } = useUpdatePersonal();

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
    updateProfile({ birthYear: _birthYear, gender });
  };
  const handleSelectChange = (value?: string | null) => {
    setBirthYear(value);
  };
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (gender === value) {
      setGender(null);
    } else {
      setGender(value as Gender);
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
