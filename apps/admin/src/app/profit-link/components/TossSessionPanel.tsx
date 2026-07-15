'use client';

import { useState } from 'react';

import { useMutationSetTossSession, useQueryHasTossSession } from '@/hooks/graphql/profitLink';

const TossSessionPanel = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const { data, loading: statusLoading, refetch } = useQueryHasTossSession();
  const [setSession, { loading: saving }] = useMutationSetTossSession({
    onCompleted: (res) => {
      if (res.setTossSession) {
        setMessage({ type: 'ok', text: '토스 세션이 갱신되었습니다. 발급이 재개됩니다.' });
        setToken('');
        refetch();
      } else {
        setMessage({ type: 'error', text: '저장에 실패했습니다. 토큰 값을 확인해주세요.' });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const handleSave = () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'TBIZAUTH 값을 입력해주세요.' });
      return;
    }
    setMessage(null);
    setSession({ variables: { token: trimmed } });
  };

  const hasSession = data?.hasTossSession;

  return (
    <div className="flex flex-col gap-6">
      {/* 현재 상태 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">현재 세션 상태</h3>
        {statusLoading ? (
          <p className="text-sm text-bodydark2">확인 중...</p>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                hasSession ? 'bg-success' : 'bg-danger'
              }`}
            />
            <span className="text-sm font-medium text-black dark:text-white">
              {hasSession
                ? '세션 있음 — 토스 발급 가동 중'
                : '세션 없음 — 토스 발급 중단됨 (아래에서 갱신 필요)'}
            </span>
          </div>
        )}
      </div>

      {/* 쿠키 획득 안내 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">TBIZAUTH 얻는 법</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-bodydark2">
          <li>
            브라우저에서{' '}
            <a
              href="https://sharelink.toss.im"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              sharelink.toss.im
            </a>{' '}
            에 파트너 계정으로 로그인
          </li>
          <li>DevTools(F12) → Application → Cookies → sharelink.toss.im</li>
          <li>
            <code className="rounded bg-gray-2 px-1 dark:bg-graydark">TBIZAUTH</code> 항목의
            값(base64 원문 그대로)을 복사
          </li>
          <li>아래에 붙여넣고 저장</li>
        </ol>
      </div>

      {/* 입력·저장 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">세션 갱신</h3>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="TBIZAUTH 값 붙여넣기"
          rows={3}
          className="font-mono mb-3 w-full rounded border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>

        {message && (
          <p className={`mt-3 text-sm ${message.type === 'ok' ? 'text-success' : 'text-danger'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default TossSessionPanel;
