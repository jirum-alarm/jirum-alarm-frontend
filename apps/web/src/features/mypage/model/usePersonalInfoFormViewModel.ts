import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Gender } from '@/shared/api/gql/graphql';
import { BIRTH_YEAR } from '@/shared/config/birthYear';
import { shallowEqual } from '@/shared/lib/utils/object';

import { AuthQueries } from '@/entities/auth';

import { useUpdatePersonal } from './update-personal';

const _BIRTH_YEAR = BIRTH_YEAR.map((year) => ({
  text: String(year),
  value: String(year),
}));
const birthYearOptions = [{ text: '선택 안 함', value: null }, ..._BIRTH_YEAR];

type PersonalInfo = { birthYear?: string | null; gender?: Gender | null };

const toPersonalInfo = (me: { birthYear?: number | null; gender?: Gender | null }) => ({
  birthYear: me.birthYear ? String(me.birthYear) : null,
  gender: me.gender,
});

const usePersonalInfoFormViewModel = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());
  const { mutate: updateProfile } = useUpdatePersonal();

  const [birthYear, setBirthYear] = useState<string | null | undefined>(() =>
    me ? toPersonalInfo(me).birthYear : undefined,
  );
  const [gender, setGender] = useState<Gender | null | undefined>(() =>
    me ? toPersonalInfo(me).gender : undefined,
  );
  const [originalInfo, setOriginalInfo] = useState<PersonalInfo | undefined>(() =>
    me ? toPersonalInfo(me) : undefined,
  );

  // 서버의 내 정보가 새로 오면 폼을 그 값으로 맞춘다 — effect 대신 렌더 중 비교로.
  const [syncedMe, setSyncedMe] = useState(me);
  if (me !== syncedMe) {
    setSyncedMe(me);
    if (me) {
      const next = toPersonalInfo(me);
      setBirthYear(next.birthYear);
      setGender(next.gender);
      setOriginalInfo(next);
    }
  }

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
