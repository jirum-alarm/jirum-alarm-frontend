'use client';
import Chip from '@/components/Chip';

import { useState } from 'react';
import useKeywordManager from '../hooks/useKeywordManager';

const KeywordInputChip = () => {
  const { keywords, addKeyword, removeKeyword } = useKeywordManager();
  const [keywordInput, setKeywordInput] = useState('');

  const handleKetwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setKeywordInput(value);
  };

  const handleKeydownEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    const keyword = keywordInput.trim();
    addKeyword(keyword);
    setKeywordInput('');
  };

  const handleDeleteKeyword = (keywordInput: string) => {
    removeKeyword(keywordInput);
  };

  return (
    <div className="rounded-lg bg-white p-5">
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        키워드 입력
      </label>
      <input
        type="text"
        placeholder="추가할 키워드를 입력해주세요"
        onChange={handleKetwordChange}
        value={keywordInput}
        onKeyDown={handleKeydownEnter}
        className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        {keywords.map((tag) => (
          <Chip key={tag} onDelete={() => handleDeleteKeyword(tag)}>
            {tag}
          </Chip>
        ))}
      </div>
    </div>
  );
};

export default KeywordInputChip;
