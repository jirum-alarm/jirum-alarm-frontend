'use client';

import { useState } from 'react';

import Card from '@/components/Card';
import {
  useAddKeywordMapEntries,
  useAddKeywordMapEntry,
  useRemoveKeywordMapEntry,
} from '@/hooks/graphql/keywordMap';

interface Props {
  groupId: number;
  entries: Array<{ id: number; keyword: string }>;
}

const EntryManager = ({ groupId, entries }: Props) => {
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
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleRemove = (id: number, keyword: string) => {
    if (confirm(`"${keyword}" 키워드를 삭제하시겠습니까?`)) {
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
            className="flex-1 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <button
            className="flex items-center rounded bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={isAdding || !keyword.trim()}
            onClick={handleAdd}
          >
            {isAdding && (
              <svg
                aria-hidden="true"
                role="status"
                className="me-2 inline h-4 w-4 animate-spin text-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            )}
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
                  className="ml-1 text-slate-400 hover:text-danger"
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
