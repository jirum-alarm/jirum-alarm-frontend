'use client';
import Card from '@/components/Card';
import React, { useState } from 'react';
import TypingEffectContainer from './TypingEffectContainer';
import { handleKeydownEnter } from '@/utils/event';

const text = `덕분에 잘 샀어요 \n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가`;

const KeywordSearch = () => {
  const [keywordInput, setKeywordInput] = useState('');

  const handleKetwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setKeywordInput(value);
  };

  const searchKeyword = () => {
    console.log('search~');
    const keyword = keywordInput.trim();
    setKeywordInput('');
  };

  return (
    <Card className="h-full">
      <h2 className=" mb-3 block text-xl font-medium text-black dark:text-white">검색</h2>
      <input
        type="text"
        placeholder=""
        onChange={handleKetwordChange}
        value={keywordInput}
        onKeyDown={handleKeydownEnter(searchKeyword)}
        className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="mt-3 h-full">
        <TypingEffectContainer text={text} />
      </div>
    </Card>
  );
};

export default KeywordSearch;
