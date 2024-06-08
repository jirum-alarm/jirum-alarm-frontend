'use client';
import Card from '@/components/Card';
import React, { useMemo, useRef, useState } from 'react';
import TypingEffectContainer from './TypingEffectContainer';
import { handleKeydownEnter } from '@/utils/event';
import useSynonymManager from '../hooks/useSynonymManager';
import Chip from '@/components/Chip';
import { useGetComments } from '@/hooks/graphql/comments';

const text = `덕분에 잘 샀어요 \n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가`;

interface Props {
  keywordId: string;
}

const KeywordSearch = ({ keywordId }: Props) => {
  const hotDealKeywordId = Number(keywordId);
  const {
    synonyms,
    onAddSynonym,
    handleRemoveSynonym,
    handleToggleSynonymActive,
    filteredSynonyms,
  } = useSynonymManager('synonym');
  const synonymInputRef = useRef<HTMLInputElement>(null);

  const { data: comments } = useGetComments({
    variables: {
      hotDealKeywordId: hotDealKeywordId,
      synonyms: filteredSynonyms,
    },
  });

  const addSynonym = () => {
    if (!synonymInputRef.current) return;
    const { value } = synonymInputRef.current;
    const keyword = value.trim();
    onAddSynonym(keyword);
    synonymInputRef.current.value = '';
  };

  const highlightedComments = useMemo(() => {
    if (!comments) return [];
    let _comments = comments.commentsByAdmin.join('\n');
    filteredSynonyms?.forEach((synonym) => {
      const regex = new RegExp(synonym, 'g');
      _comments = _comments.replace(regex, `<span class="bg-green-300">${synonym}</span>`);
    });

    return _comments.split('\n');
  }, [comments, filteredSynonyms]);

  return (
    <Card className="h-full">
      <h2 className=" mb-3 block text-xl font-medium text-black dark:text-white">검색</h2>
      <input
        ref={synonymInputRef}
        type="text"
        placeholder=""
        onKeyDown={handleKeydownEnter(addSynonym)}
        className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        {synonyms.map((synonym) => (
          <Chip
            key={synonym.text}
            onDelete={() => handleRemoveSynonym(synonym.text)}
            isChecked={synonym.isChecked}
            isActive={synonym.isSaved}
            onClick={() => handleToggleSynonymActive(synonym.text)}
          >
            {synonym.text}
          </Chip>
        ))}
      </div>
      <div className="mt-3 h-full">
        <TypingEffectContainer comments={highlightedComments} />
      </div>
    </Card>
  );
};

export default KeywordSearch;
