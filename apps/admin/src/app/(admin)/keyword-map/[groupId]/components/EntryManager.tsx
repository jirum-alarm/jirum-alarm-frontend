'use client';

import { useState } from 'react';

import Card from '@/components/Card';
import { useConfirm } from '@/components/Confirm';
import Spinner from '@/components/Spinner';
import {
  useAddKeywordMapEntries,
  useAddKeywordMapEntry,
  useRemoveKeywordMapEntry,
} from '@/hooks/graphql/keywordMap';

interface Props {
  groupId: number;
  entries: Array<{ id: string; keyword: string }>;
}

const EntryManager = ({ groupId, entries }: Props) => {
  const confirm = useConfirm();
  const [keyword, setKeyword] = useState('');
  const [addEntry, { loading: addingOne }] = useAddKeywordMapEntry(groupId);
  const [addEntries, { loading: addingBulk }] = useAddKeywordMapEntries(groupId);
  const [removeEntry] = useRemoveKeywordMapEntry(groupId);

  const isAdding = addingOne || addingBulk;

  const handleAdd = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const keywords = trimmed
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (keywords.length === 0) return;

    if (keywords.length === 1) {
      addEntry({
        variables: { groupId, keyword: keywords[0] },
        onCompleted: () => setKeyword(''),
      });
    } else {
      addEntries({
        variables: { groupId, keywords },
        onCompleted: () => setKeyword(''),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter 는 글자 확정용 — 반쯤 조합된 글자로 실행하지 않는다
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleAdd();
    }
  };

  const handleRemove = async (id: string, keyword: string) => {
    if (await confirm({ message: `"${keyword}" 키워드를 삭제하시겠습니까?`, danger: true })) {
      removeEntry({ variables: { id: Number(id) } });
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <h4 className="text-lg font-semibold text-black dark:text-white">
          키워드 엔트리 ({entries.length})
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="키워드 입력 (쉼표로 구분하여 여러 개 추가 가능)"
            className="min-w-0 flex-1 rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary sm:px-5"
          />
          <button
            className="flex shrink-0 items-center rounded bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={isAdding || !keyword.trim()}
            onClick={handleAdd}
          >
            {isAdding && <Spinner size="sm" color="white" className="me-2" />}
            추가
          </button>
        </div>

        {entries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm dark:bg-meta-4"
              >
                <span className="text-black dark:text-white">{entry.keyword}</span>
                <button
                  onClick={() => handleRemove(entry.id, entry.keyword)}
                  className="-my-1 ml-0.5 p-1 text-slate-400 hover:text-danger sm:my-0 sm:ml-1 sm:p-0"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4L10 10M10 4L4 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">등록된 키워드가 없습니다.</p>
        )}
      </div>
    </Card>
  );
};

export default EntryManager;
