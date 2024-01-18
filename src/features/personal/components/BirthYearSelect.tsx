import React from 'react';
import Select from '@/components/common/Select';
import { BIRTH_YEAR } from '@/constants/birthYear';

interface BirthYearSelectProps {
  handleSelectChange: (value: string) => void;
  birthYear?: string;
}

const BIRTH_YEAR_OPTIONS = ['선택안함', ...BIRTH_YEAR];

const BirthYearSelect = ({ handleSelectChange, birthYear }: BirthYearSelectProps) => {
  return (
    <fieldset>
      <legend className="pb-2 text-sm text-gray-500">출생년도</legend>
      <Select placeholder="출생년도" onChange={handleSelectChange} defaultValue={birthYear}>
        {BIRTH_YEAR_OPTIONS.map((year) => (
          <Select.Option key={year} value={String(year)}>
            {year}
          </Select.Option>
        ))}
      </Select>
    </fieldset>
  );
};

export default BirthYearSelect;
