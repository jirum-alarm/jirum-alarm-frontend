'use client';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Card from '@/components/Card';
import Chip from '@/components/Chip';
import { useToast } from '@/components/Toast';
import { useGetComments } from '@/hooks/graphql/comments';
import {
  useAddHotDealExcludeKeywordByAdmin,
  useAddHotDealKeywordSynonymByAdmin,
  useRemoveHotDealExcludeKeyword,
  useRemoveHotDealKeywordSynonym,
} from '@/hooks/graphql/synonym';
import { handleKeydownEnter } from '@/utils/event';

import useSynonymManager from '../hooks/useSynonymManager';

import CommentsContainer from './CommentsContainer';

interface Props {
  keywordId: string;
  synonymList: Array<{ id: string; hotDealKeywordId: number; keyword: string }>;
  excludeKeywordList: Array<{ id: string; hotDealKeywordId: number; excludeKeyword: string }>;
}

const SynonymInputResult = ({ keywordId, synonymList, excludeKeywordList }: Props) => {
  const router = useRouter();
  const toast = useToast();
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

  const [removeSynonym] = useRemoveHotDealKeywordSynonym(hotDealKeywordId);
  const [removeExcludeSynonym] = useRemoveHotDealExcludeKeyword(hotDealKeywordId);
  const [saveSynonym] = useAddHotDealKeywordSynonymByAdmin(hotDealKeywordId);
  const [saveExcludeSynonym] = useAddHotDealExcludeKeywordByAdmin(hotDealKeywordId);

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
    synonymInputRef.current.value = '';
    // 빈 칩이 저장되면 keywords:[""] 가 서버 @IsNotEmpty 에 걸려 저장 전체가 Bad Request 가 된다
    if (!keyword) return;
    onAddSynonym(keyword);
  };

  const addExcludeSynonym = () => {
    if (!excludeSynonymInputRef.current) return;
    const { value } = excludeSynonymInputRef.current;
    const keyword = value.trim();
    excludeSynonymInputRef.current.value = '';
    if (!keyword) return;
    onAddExcludeSynonym(keyword);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSynonym = async () => {
    if (isSaving) return;
    const toDeleteSynonym = synonymList.filter(
      (synonym) => !synonyms.map((synonym) => synonym.text).includes(synonym.keyword),
    );

    const toAddSynonym = synonyms.filter(
      (synonym) => !synonymList.map((synonym) => synonym.keyword).includes(synonym.text),
    );

    const toDeleteExcludeSynonym = excludeKeywordList.filter(
      (synonym) => !excludeSynonyms.map((synonym) => synonym.text).includes(synonym.excludeKeyword),
    );

    const toAddExcludeSynonym = excludeSynonyms.filter(
      (synonym) =>
        !excludeKeywordList.map((synonym) => synonym.excludeKeyword).includes(synonym.text),
    );

    const requests: Promise<unknown>[] = [];
    if (toDeleteSynonym.length) {
      requests.push(
        removeSynonym({ variables: { ids: toDeleteSynonym.map((synonym) => Number(synonym.id)) } }),
      );
    }
    if (toAddSynonym.length) {
      requests.push(
        saveSynonym({
          variables: {
            hotDealKeywordId: hotDealKeywordId,
            keywords: toAddSynonym.map((synonym) => synonym.text),
          },
        }),
      );
    }
    if (toDeleteExcludeSynonym.length) {
      requests.push(
        removeExcludeSynonym({
          variables: { ids: toDeleteExcludeSynonym.map((synonym) => Number(synonym.id)) },
        }),
      );
    }
    if (toAddExcludeSynonym.length) {
      requests.push(
        saveExcludeSynonym({
          variables: {
            hotDealKeywordId: hotDealKeywordId,
            excludeKeywords: toAddExcludeSynonym.map((synonym) => synonym.text),
          },
        }),
      );
    }

    if (requests.length === 0) {
      toast.info('변경 사항이 없습니다.');
      return;
    }

    // 예전엔 응답을 기다리지 않고 바로 "저장 완료" 를 띄워 서버가 거부해도 성공으로 보였다
    setIsSaving(true);
    try {
      await Promise.all(requests);
      toast.success('저장이 완료되었습니다!');
    } catch (e) {
      // 일부만 반영됐을 수 있다 — 성공한 요청의 refetch 가 칩을 서버 상태로 다시 맞춘다
      toast.error(`저장 실패: ${(e as Error).message}`);
    } finally {
      setIsSaving(false);
    }

    // onReset();
  };

  return (
    <Card>
      <div className="flex w-full justify-end">
        <button
          className="rounded-xl bg-lime-400 px-4 py-2 text-white disabled:opacity-50 sm:p-2"
          onClick={handleSaveSynonym}
          disabled={isSaving}
        >
          {isSaving ? '저장 중…' : '저장'}
        </button>
      </div>
      <h2 className="mb-3 block text-xl font-medium text-black dark:text-white">유의어 검색</h2>
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
        <CommentsContainer
          comments={comments?.commentsByAdmin}
          highlightedSynonym={filteredSynonyms}
          highlightedExcludeSynonym={filteredExcludeSynonyms}
        />
      </div>
    </Card>
  );
};

export default SynonymInputResult;
