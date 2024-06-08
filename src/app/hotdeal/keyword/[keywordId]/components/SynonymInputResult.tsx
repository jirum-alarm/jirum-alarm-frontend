'use client';
import React, { useEffect, useMemo, useRef } from 'react';
import Chip from '@/components/Chip';
import TypingEffectContainer from './TypingEffectContainer';
import { handleKeydownEnter } from '@/utils/event';
import useSynonymManager from '../hooks/useSynonymManager';
import Card from '@/components/Card';
import { useGetComments } from '@/hooks/graphql/comments';
import {
  useAddHotDealExcludeKeywordByAdmin,
  useAddHotDealKeywordSynonymByAdmin,
  useRemoveHotDealExcludeKeyword,
  useRemoveHotDealKeywordSynonym,
} from '@/hooks/graphql/synonym';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  keywordId: string;
  synonymList: Array<{ id: number; hotDealKeywordId: number; keyword: string }>;
  excludeKeywordList: Array<{ id: number; hotDealKeywordId: number; excludeKeyword: string }>;
}

const SynonymInputResult = ({ keywordId, synonymList, excludeKeywordList }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const hotDealKeywordId = Number(keywordId);

  const {
    synonyms,
    syncSavedSynonymsToState,
    onAddSynonym,
    handleRemoveSynonym,
    handleToggleSynonymActive,
    filteredSynonyms,
    onReset,
  } = useSynonymManager('synonym');
  const {
    synonyms: excludeSynonyms,
    syncSavedSynonymsToState: syncSavedExcludeSynonymsToState,
    onAddSynonym: onAddExcludeSynonym,
    handleRemoveSynonym: handleRemoveExcludeSynonym,
    handleToggleSynonymActive: handleToggleExcludeSynonymActive,
    filteredSynonyms: filteredExcludeSynonyms,
  } = useSynonymManager('exclude-synonym');

  const [removeSynonym] = useRemoveHotDealKeywordSynonym();
  const [removeExcludeSynonym] = useRemoveHotDealExcludeKeyword();
  const [saveSynonym] = useAddHotDealKeywordSynonymByAdmin();
  const [saveExcludeSynonym] = useAddHotDealExcludeKeywordByAdmin();

  useEffect(() => {
    syncSavedSynonymsToState(synonymList.map((synonym) => synonym.keyword));
    syncSavedExcludeSynonymsToState(excludeKeywordList.map((synonym) => synonym.excludeKeyword));
  }, [synonymList, excludeKeywordList]);

  const { data: comments } = useGetComments({
    variables: {
      hotDealKeywordId: hotDealKeywordId,
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

  const handleSaveSynonym = () => {
    const toDeleteSynonym = synonymList.filter(
      (synonym) => !synonyms.map((synonym) => synonym.text).includes(synonym.keyword),
    );

    const toAddSynonym = synonyms.filter(
      (synonym) => !synonymList.map((synonym) => synonym.keyword).includes(synonym.text),
    );

    if (toDeleteSynonym.length) {
      removeSynonym({
        variables: {
          ids: toDeleteSynonym.map((synonym) => Number(synonym.id)),
        },
      });
    }
    if (toAddSynonym.length) {
      saveSynonym({
        variables: {
          hotDealKeywordId: hotDealKeywordId,
          keywords: toAddSynonym.map((synonym) => synonym.text),
        },
      });
    }

    const toDeleteExcludeSynonym = excludeKeywordList.filter(
      (synonym) => !excludeSynonyms.map((synonym) => synonym.text).includes(synonym.excludeKeyword),
    );

    const toAddExcludeSynonym = excludeSynonyms.filter(
      (synonym) =>
        !excludeKeywordList.map((synonym) => synonym.excludeKeyword).includes(synonym.text),
    );

    if (toDeleteExcludeSynonym.length) {
      removeExcludeSynonym({
        variables: {
          ids: toDeleteExcludeSynonym.map((synonym) => Number(synonym.id)),
        },
      });
    }
    if (toAddExcludeSynonym.length) {
      saveExcludeSynonym({
        variables: {
          hotDealKeywordId: hotDealKeywordId,
          excludeKeywords: toAddExcludeSynonym.map((synonym) => synonym.text),
        },
      });
    }

    // onReset();
  };

  const highlightedComments = useMemo(() => {
    if (!comments) return [];
    let _comments = comments.commentsByAdmin.join('\n');
    filteredSynonyms?.forEach((synonym) => {
      const regex = new RegExp(synonym, 'g');
      _comments = _comments.replace(regex, `<span class="bg-green-300">${synonym}</span>`);
    });
    filteredExcludeSynonyms?.forEach((synonym) => {
      const regex = new RegExp(synonym, 'g');
      _comments = _comments.replace(regex, `<span class="bg-rose-300">${synonym}</span>`);
    });
    return _comments.split('\n');
  }, [comments, filteredSynonyms, filteredExcludeSynonyms]);

  return (
    <Card>
      <div className="flex w-full justify-end">
        <button className="rounded-xl bg-lime-400 p-2 text-white" onClick={handleSaveSynonym}>
          저장
        </button>
      </div>
      <h2 className=" mb-3 block text-xl font-medium text-black dark:text-white ">유의어 검색</h2>
      <input
        ref={synonymInputRef}
        type="text"
        placeholder="추가할 유의어를 검색해주세요"
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
      <h2 className="mb-3 mt-3 block text-xl font-medium text-black dark:text-white">
        제외 유의어 검색
      </h2>
      <input
        ref={excludeSynonymInputRef}
        type="text"
        placeholder="제외할 유의어를 검색해주세요"
        onKeyDown={handleKeydownEnter(addExcludeSynonym)}
        className="mb-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        {excludeSynonyms.map((synonym) => (
          <Chip
            key={synonym.text}
            onDelete={() => handleRemoveExcludeSynonym(synonym.text)}
            isChecked={synonym.isChecked}
            isActive={synonym.isSaved}
            onClick={() => handleToggleExcludeSynonymActive(synonym.text)}
          >
            {synonym.text}
          </Chip>
        ))}
      </div>
      <div className="mt-3">
        <TypingEffectContainer comments={highlightedComments} />
      </div>
    </Card>
  );
};

export default SynonymInputResult;
