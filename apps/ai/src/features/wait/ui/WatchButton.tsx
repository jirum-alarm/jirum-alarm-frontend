'use client';

import { useState } from 'react';

type Condition = {
  keyword: string;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
};

/**
 * 「이 가격 오면 알려줘」 — 답 끝에 할 일을 놓는다(8월 AI 챗은 답만 하고 끝나서 막다른 길이었다).
 * 등록은 기존 알림 키워드 그대로라 앱·웹 마이페이지에서 보이고 지울 수 있다.
 */
export default function WatchButton({
  condition,
  label,
  priced,
}: {
  condition: Condition;
  label: string;
  /** 「좋은 가격」을 말할 수 있나 — 아니면(카테고리·섞임) 새 딜 알림으로 말한다 */
  priced: boolean;
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setState('busy');
    const res = await fetch('/api/wait/watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(condition),
    }).catch(() => null);
    if (res?.ok) {
      setState('done');
      return;
    }
    const body = (await res?.json().catch(() => null)) as { message?: string } | null;
    setMessage(body?.message ?? '잠시 뒤 다시 시도해 주세요.');
    setState('error');
  };

  if (state === 'done') {
    return (
      <p className="bg-success-50 text-13 text-success-700 rounded-2xl px-4 py-3 text-center font-semibold">
        알림을 걸었어요 — 「{condition.keyword}」 딜이 뜨면 바로 알려 드릴게요
      </p>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={submit}
        disabled={state === 'busy'}
        className="tappable text-15 h-[52px] w-full rounded-full bg-gray-900 font-bold text-white active:bg-gray-700 disabled:opacity-50"
      >
        {state === 'busy'
          ? '거는 중…'
          : priced
            ? `${label} 좋은 가격 오면 알려줘`
            : `${label} 새 딜 알려줘`}
      </button>
      {state === 'error' && <p className="text-13 text-error-600 mt-2 text-center">{message}</p>}
    </div>
  );
}
