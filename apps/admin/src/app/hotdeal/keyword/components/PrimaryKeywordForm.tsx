'use client';

import React, { useState } from 'react';

import Card from '@/components/Card';
import { HotDealKeywordType } from '@/types/keyword';

import RadioButton from '../register/components/RadioButton';

interface Props {
  onChangeKeyword?: (value: string) => void;
  keyword: string;
}

const PrimaryKeywordForm = ({ onChangeKeyword, keyword }: Props) => {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeKeyword?.(e.currentTarget.value);
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
          className="h-full w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>
    </Card>
  );
};

export default PrimaryKeywordForm;
