'use client';

import { type ClipboardEvent, useState } from 'react';

import {
  useMutationIssueTossProfitLink,
  useMutationSetTossSession,
  useQueryHasTossSession,
} from '@/hooks/graphql/profitLink';

import { parseTossTbizAuth } from '../lib/parse-toss-tbizauth';

const TossSessionPanel = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [productUrl, setProductUrl] = useState('');
  const [issuedLink, setIssuedLink] = useState<string | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, loading: statusLoading, refetch } = useQueryHasTossSession();
  const [setSession, { loading: saving }] = useMutationSetTossSession({
    onCompleted: (res) => {
      if (res.setTossSession) {
        setMessage({ type: 'ok', text: '토스 세션이 갱신되었습니다. 정산 폴링이 재개됩니다.' });
        setToken('');
        refetch();
      } else {
        setMessage({ type: 'error', text: '저장에 실패했습니다. 토큰 값을 확인해주세요.' });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const [issueLink, { loading: issuing }] = useMutationIssueTossProfitLink({
    onCompleted: (res) => {
      const out = res.issueTossProfitLink;
      if (out.profitLink) {
        setIssuedLink(out.profitLink);
        setIssueError(null);
      } else {
        setIssuedLink(null);
        setIssueError(out.error ?? '발급에 실패했습니다.');
      }
    },
    onError: (e) => {
      setIssuedLink(null);
      setIssueError(e.message);
    },
  });

  const showParsedToken = (raw: string) => {
    const parsed = parseTossTbizAuth(raw);
    if (!parsed) {
      setToken('');
      setMessage({
        type: 'error',
        text: 'TBIZAUTH를 찾지 못했습니다. curl/쿠키를 다시 확인해주세요.',
      });
      return false;
    }
    setToken(parsed);
    if (parsed !== raw.trim()) {
      setMessage({ type: 'ok', text: 'TBIZAUTH만 추출했습니다. 저장을 누르면 반영됩니다.' });
    } else {
      setMessage(null);
    }
    return true;
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted.trim()) return;
    e.preventDefault();
    showParsedToken(pasted);
  };

  const handleSave = () => {
    const parsed = parseTossTbizAuth(token);
    if (!parsed) {
      setMessage({ type: 'error', text: 'TBIZAUTH 값을 입력해주세요.' });
      return;
    }
    setToken(parsed);
    setMessage(null);
    setSession({ variables: { token: parsed } });
  };

  const handleIssue = () => {
    const trimmed = productUrl.trim();
    if (!trimmed) {
      setIssuedLink(null);
      setIssueError('토스 상품 주소를 입력해주세요.');
      return;
    }
    setCopied(false);
    setIssuedLink(null);
    setIssueError(null);
    issueLink({ variables: { url: trimmed } });
  };

  const handleCopy = async () => {
    if (!issuedLink) return;
    try {
      await navigator.clipboard.writeText(issuedLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const hasSession = data?.hasTossSession;

  return (
    <div className="flex flex-col gap-6">
      {/* 상품 URL → 수익링크 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">
          상품 URL → 수익링크
        </h3>
        <p className="mb-4 text-xs text-bodydark2">
          토스 상품 주소를 우리 파트너 수익링크로 바꿉니다. 지원:{' '}
          <code className="rounded bg-gray-2 px-1 dark:bg-graydark">shopping.toss.im/c/숫자</code>,{' '}
          <code className="rounded bg-gray-2 px-1 dark:bg-graydark">toss.shopping/t/숫자</code>,{' '}
          <code className="rounded bg-gray-2 px-1 dark:bg-graydark">toss.im/_m/…</code>, 또는
          tacaItemId 숫자. <code className="rounded bg-gray-2 px-1 dark:bg-graydark">/p/</code>{' '}
          주소는 불가. 딜 저장 없이 링크만 발급됩니다.
        </p>
        <input
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleIssue();
          }}
          placeholder="https://shopping.toss.im/c/123456 또는 tacaItemId"
          className="mb-3 w-full rounded border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
        />
        <button
          onClick={handleIssue}
          disabled={issuing}
          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
        >
          {issuing ? '발급 중...' : '수익링크 발급'}
        </button>

        {issuedLink && (
          <div className="mt-4 rounded border border-stroke bg-gray-2 p-3 dark:border-strokedark dark:bg-graydark">
            <p className="mb-1 text-xs text-bodydark2">발급된 수익링크</p>
            <div className="flex items-center gap-2">
              <a
                href={issuedLink}
                target="_blank"
                rel="noreferrer"
                className="font-mono flex-1 break-all text-sm text-primary underline"
              >
                {issuedLink}
              </a>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded border border-stroke px-3 py-1 text-xs text-black hover:bg-white dark:border-strokedark dark:text-white dark:hover:bg-boxdark"
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          </div>
        )}
        {issueError && <p className="mt-3 text-sm text-danger">{issueError}</p>}
      </div>

      {/* 현재 상태 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">현재 세션 상태</h3>
        {statusLoading ? (
          <p className="text-sm text-bodydark2">확인 중...</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  hasSession ? 'bg-success' : 'bg-danger'
                }`}
              />
              <span className="text-sm font-medium text-black dark:text-white">
                {hasSession
                  ? '세션 유효 — 정산 폴링 가능'
                  : '세션 없음/만료 — 정산 폴링 중단 (아래에서 갱신 필요)'}
              </span>
            </div>
            <p className="mt-2 text-xs text-bodydark2">
              Redis 키 존재가 아니라 토스 정산 API에 실제로 물어봅니다. 링크 발급은 공식 OAuth2라 이
              세션과 무관합니다.
            </p>
          </>
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
          <li>
            또는 Network에서 sharelink 요청 Copy as cURL. 붙여넣는 순간{' '}
            <code className="rounded bg-gray-2 px-1 dark:bg-graydark">TBIZAUTH</code>만 칸에
            남습니다
          </li>
          <li>값이 맞으면 저장</li>
        </ol>
      </div>

      {/* 입력·저장 */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">세션 갱신</h3>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onPaste={handlePaste}
          placeholder="여기에 curl 또는 Cookie 붙여넣기 — TBIZAUTH만 표시됩니다"
          rows={2}
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
