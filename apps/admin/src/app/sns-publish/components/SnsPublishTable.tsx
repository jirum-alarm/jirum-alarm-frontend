'use client';

import { useState, useTransition } from 'react';

import { rejectDraft, type SnsDraft } from '../actions';

const SnsPublishTable = ({ initialDrafts }: { initialDrafts: SnsDraft[] }) => {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const handleReject = (id: number) => {
    if (!confirm('이 초안을 반려할까요? 발행되지 않습니다.')) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await rejectDraft(id);
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        setMessage({ type: 'ok', text: `#${id} 반려됨 (발행 제외)` });
      } catch (e) {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : String(e) });
      } finally {
        setPendingId(null);
      }
    });
  };

  if (drafts.length === 0) {
    return (
      <div className="rounded border border-stroke bg-white p-8 text-center text-sm text-bodydark2 dark:border-strokedark dark:bg-boxdark">
        발행 대기 중인 초안이 없습니다. 30분마다 새 초안이 생성됩니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div
          className={`rounded p-3 text-sm ${
            message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex flex-col gap-4">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-bodydark2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">#{d.id}</span>
                  <span className="bg-gray-100 rounded px-2 py-0.5 dark:bg-meta-4">
                    {d.channel}
                  </span>
                  <span className="bg-gray-100 rounded px-2 py-0.5 dark:bg-meta-4">
                    {d.hookType} · {d.tone}
                  </span>
                  <span>productId {d.productId}</span>
                  <span>{new Date(d.createdAt).toLocaleString('ko-KR')}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-black dark:text-white">{d.copy}</p>
                {d.selectionReason && (
                  <p className="text-xs text-bodydark2">선정 이유: {d.selectionReason}</p>
                )}
                <a
                  href={d.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline"
                >
                  {d.targetUrl}
                </a>
              </div>
              {d.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.imageUrl}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded object-cover"
                />
              )}
              <button
                onClick={() => handleReject(d.id)}
                disabled={pendingId === d.id}
                className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0 rounded border px-4 py-2 text-sm disabled:opacity-50"
              >
                {pendingId === d.id ? '반려 중…' : '반려'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnsPublishTable;
