'use client';

import { type ClipboardEvent, type ReactNode } from 'react';

type SessionRefreshCardProps = {
  title: string;
  hasSession?: boolean;
  statusLoading: boolean;
  okText: string;
  badText: string;
  howTo: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  saving: boolean;
  message: { type: 'ok' | 'error'; text: string } | null;
};

const SessionRefreshCard = ({
  title,
  hasSession,
  statusLoading,
  okText,
  badText,
  howTo,
  placeholder,
  value,
  onChange,
  onPaste,
  onSave,
  saving,
  message,
}: SessionRefreshCardProps) => {
  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-black dark:text-white">{title}</h3>
        {statusLoading ? (
          <span className="text-xs text-bodydark2">확인 중...</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                hasSession ? 'bg-success' : 'bg-danger'
              }`}
            />
            <span className="text-xs text-black dark:text-white">
              {hasSession ? okText : badText}
            </span>
          </div>
        )}
      </div>

      <details className="mb-3">
        <summary className="cursor-pointer text-xs text-bodydark2">갱신 방법</summary>
        <div className="mt-2 text-xs text-bodydark2">{howTo}</div>
      </details>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        placeholder={placeholder}
        rows={2}
        className="font-mono mb-3 w-full rounded border border-stroke bg-transparent px-3 py-2 text-xs text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
      />
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
      >
        {saving ? '저장 중...' : '저장'}
      </button>

      {message && (
        <p className={`mt-2 text-sm ${message.type === 'ok' ? 'text-success' : 'text-danger'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default SessionRefreshCard;
