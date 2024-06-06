'use client';
import Card from '@/components/Card';
import React, { useState } from 'react';
import RadioButton from './RadioButton';
import { HotDealKeywordType } from '@/types/keyword';

const TypeList = [
  {
    type: '긍정',
    value: HotDealKeywordType.POSITIVE,
  },
  {
    type: '부정',
    value: HotDealKeywordType.NEGATIVE,
  },
];

interface Props {
  onChangeKeyword: (value: string) => void;
  onChangeKeywordType: (type: HotDealKeywordType) => void;
  keyword: string;
  keywordType: HotDealKeywordType;
}

const PrimaryKeyword = ({ onChangeKeyword, onChangeKeywordType, keyword, keywordType }: Props) => {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeKeyword(e.currentTarget.value);
  };
  const handleTypeChange = (value: string) => {
    const type = value as HotDealKeywordType;
    onChangeKeywordType(type);
  };
  return (
    <Card>
      <h2 className="mb-3 block text-xl font-medium text-black dark:text-white">대표 키워드</h2>
      <div className="flex h-10">
        <input
          type="text"
          placeholder="대표 키워드 입력"
          value={keyword}
          onChange={handleKeywordChange}
          className="h-full w-full rounded-r-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>
      <div>
        <fieldset className="mt-4">
          <legend className="text-xl text-black">유형</legend>
          {TypeList.map((type, i) => (
            <RadioButton
              key={i}
              name="keywordType"
              text={type.type}
              value={type.value}
              checked={keywordType === type.value}
              onChange={handleTypeChange}
              id={type.type}
            />
          ))}
        </fieldset>
      </div>
    </Card>
  );
};

export default PrimaryKeyword;
