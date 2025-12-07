'use client';

import { BirthYearSelect, GenderRadioGroup } from '@entities/user';

import Button from '@/shared/ui/Button';

import usePersonalInfoFormViewModel from '../hooks/usePersonalInfoFormViewModel';

const PersonalInfoForm = () => {
  const {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    birthYearOptions,
  } = usePersonalInfoFormViewModel();
  return (
    <form className="flex flex-1 flex-col justify-between pt-22" onSubmit={handleSubmit}>
      <div>
        <BirthYearSelect
          handleSelectChange={handleSelectChange}
          birthYear={birthYear}
          birthYearOptions={birthYearOptions}
        />
        <div className="h-10" />
        <GenderRadioGroup handleRadioChange={handleRadioChange} gender={gender} />
      </div>
      <Button type="submit">저장</Button>
    </form>
  );
};

export default PersonalInfoForm;
