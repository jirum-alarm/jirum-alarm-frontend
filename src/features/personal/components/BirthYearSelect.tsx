import React from 'react';
import Select from '@/components/common/Select';

interface BirthYearSelectProps {
  handleSelectChange: (value?: string | null) => void;
  birthYear?: string | null;
  birthYearOptions: Array<{ text: string; value: string | null }>;
}

const BirthYearSelect = ({
  handleSelectChange,
  birthYear,
  birthYearOptions,
}: BirthYearSelectProps) => {
  return (
    <fieldset>
      <legend className="pb-2 text-sm text-gray-500">출생년도</legend>
      <Select placeholder="출생년도" onChange={handleSelectChange} defaultValue={birthYear}>
        {birthYearOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.text}
          </Select.Option>
        ))}
      </Select>
    </fieldset>
  );
};

export default BirthYearSelect;
