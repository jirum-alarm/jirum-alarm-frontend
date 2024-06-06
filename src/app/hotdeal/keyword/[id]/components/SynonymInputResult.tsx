'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Chip from '@/components/Chip';
import TypingEffectContainer from './TypingEffectContainer';
import { handleKeydownEnter } from '@/utils/event';
import useSynonymManager from '../hooks/useSynonymManager';
import Card from '@/components/Card';
import { useGetComments } from '@/hooks/graphql/comments';

const SynonymInputResult = () => {
  const {
    synonyms,
    onAddSynonym,
    handleRemoveSynonym,
    handleToggleSynonymActive,
    filteredSynonyms,
  } = useSynonymManager('synonym');
  const {
    synonyms: excludeSynonyms,
    onAddSynonym: onAddExcludeSynonym,
    handleRemoveSynonym: handleRemoveExcludeSynonym,
    handleToggleSynonymActive: handleToggleExcludeSynonymActive,
    filteredSynonyms: filteredExcludeSynonyms,
  } = useSynonymManager('exclude-synonym');

  console.log('re-render');

  const { data: comments } = useGetComments({
    variables: {
      hotDealKeywordId: 1,
      synonyms: filteredSynonyms,
      excludes: filteredExcludeSynonyms,
    },
  });

  const synonymInputRef = useRef<HTMLInputElement>(null);
  const excludeSynonymInputRef = useRef<HTMLInputElement>(null);

  const addSynonym = () => {
    if (!synonymInputRef.current) return;
    const { value } = synonymInputRef.current;
    const keyword = value.trim();
    onAddSynonym(keyword);
    synonymInputRef.current.value = '';
  };

  const addExcludeSynonym = () => {
    if (!excludeSynonymInputRef.current) return;
    const { value } = excludeSynonymInputRef.current;
    const keyword = value.trim();
    onAddExcludeSynonym(keyword);
    excludeSynonymInputRef.current.value = '';
  };

  const highlightedComments = useMemo(() => {
    if (!comments) return '';
    let _comments = comments.commentsByAdmin.join('\n');
    filteredSynonyms?.forEach((synonym) => {
      const regex = new RegExp(synonym, 'g');
      _comments = _comments.replace(regex, `<span class="bg-green-300">${synonym}</span>`);
    });
    filteredExcludeSynonyms?.forEach((synonym) => {
      const regex = new RegExp(synonym, 'g');
      _comments = _comments.replace(regex, `<span class="bg-rose-300">${synonym}</span>`);
    });
    return _comments;
  }, [comments, filteredSynonyms, filteredExcludeSynonyms]);

  return (
    <Card>
      <h2 className=" mb-3 block text-xl font-medium text-black dark:text-white ">유의어 검색</h2>
      <input
        ref={synonymInputRef}
        type="text"
        placeholder="추가할 유의어를 입력해주세요"
        onKeyDown={handleKeydownEnter(addSynonym)}
        className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        {synonyms.map((synonym) => (
          <Chip
            key={synonym.text}
            onDelete={() => handleRemoveSynonym(synonym.text)}
            isChecked={synonym.isActive}
            isActive
            onClick={() => handleToggleSynonymActive(synonym.text)}
          >
            {synonym.text}
          </Chip>
        ))}
      </div>
      <h2 className="mb-3 mt-3 block text-xl font-medium text-black dark:text-white">
        제외 단어 검색
      </h2>
      <input
        ref={excludeSynonymInputRef}
        type="text"
        placeholder="제외할 유의어를 입력해주세요"
        onKeyDown={handleKeydownEnter(addExcludeSynonym)}
        className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        {excludeSynonyms.map((synonym) => (
          <Chip
            key={synonym.text}
            onDelete={() => handleRemoveExcludeSynonym(synonym.text)}
            isChecked={synonym.isActive}
            isActive
            onClick={() => handleToggleExcludeSynonymActive(synonym.text)}
          >
            {synonym.text}
          </Chip>
        ))}
      </div>
      <div className="mt-3">
        <TypingEffectContainer text={highlightedComments} />
      </div>
    </Card>
  );
};

export default SynonymInputResult;
