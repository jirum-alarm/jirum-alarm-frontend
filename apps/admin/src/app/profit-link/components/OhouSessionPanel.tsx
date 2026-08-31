'use client';

import { type ClipboardEvent, useState } from 'react';

import {
  useMutationIssueOhouProfitLink,
  useMutationSetOhouSession,
  useQueryHasOhouSession,
} from '@/hooks/graphql/profitLink';

import { parseOhouSession } from '../lib/parse-ohou-session';

const OhouSessionPanel = () => {
  const [rawPaste, setRawPaste] = useState('');
  const [display, setDisplay] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [productUrl, setProductUrl] = useState('');
  const [issuedLink, setIssuedLink] = useState<string | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, loading: statusLoading, refetch } = useQueryHasOhouSession();
  const [setSession, { loading: saving }] = useMutationSetOhouSession({
    onCompleted: (res) => {
      if (res.setOhouSession) {
        setMessage({
          type: 'ok',
          text: '큐레이터 세션이 갱신되었습니다. ?af 제휴 링크로 발급됩니다.',
        });
        setRawPaste('');
        setDisplay('');
        refetch();
      } else {
        setMessage({
          type: 'error',
          text: '저장에 실패했습니다. 로그인 후 sharelink curl인지, 응답에 ?af가 붙는지 확인해주세요.',
        });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const [issueLink, { loading: issuing }] = useMutationIssueOhouProfitLink({
    onCompleted: (res) => {
      const out = res.issueOhouProfitLink;
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

  const showParsed = (raw: string) => {
    const parsed = parseOhouSession(raw);
    if (!parsed) {
      setRawPaste('');
      setDisplay('');
      setMessage({
        type: 'error',
        text: 'cookie와 userId를 찾지 못했습니다. 상품 페이지에서 로그인 후 공유하기 → sharelink 요청을 Copy as cURL 해주세요.',
      });
      return;
    }
    setRawPaste(raw);
    setDisplay(`userId=${parsed.userId}`);
    setMessage({
      type: 'ok',
      text: `userId ${parsed.userId}만 표시합니다. 저장을 누르면 세션이 반영됩니다.`,
    });
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted.trim()) return;
    e.preventDefault();
    showParsed(pasted);
  };

  const handleSave = () => {
    const payload = rawPaste || display;
    const parsed = parseOhouSession(payload);
    if (!parsed) {
      setMessage({
        type: 'error',
        text: '로그인 sharelink curl을 붙여넣어 주세요.',
      });
      return;
    }
    setMessage(null);
    setSession({ variables: { curl: payload } });
  };

  const handleIssue = () => {
    const trimmed = productUrl.trim();
    if (!trimmed) {
      setIssuedLink(null);
      setIssueError('오늘의집 상품 주소를 입력해주세요.');
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

  const hasSession = data?.hasOhouSession;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">
          상품 URL → 큐레이터 링크
        </h3>
        <p className="mb-4 text-xs text-bodydark2">
          오늘의집 상품을 <code className="rounded bg-gray-2 px-1 dark:bg-graydark">?af</code> 제휴
          링크로 바꿉니다. 지원:{' '}
          <code className="rounded bg-gray-2 px-1 dark:bg-graydark">store.ohou.se/goods/숫자</code>,
          또는 goods id. 딜 저장 없이 링크만 발급됩니다.
        </p>
        <input
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleIssue();
          }}
          placeholder="https://store.ohou.se/goods/1134186"
          className="mb-3 w-full rounded border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
        />
        <button
          onClick={handleIssue}
          disabled={issuing}
          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50"
        >
          {issuing ? '발급 중...' : '제휴 링크 발급'}
        </button>

        {issuedLink && (
          <div className="mt-4 rounded border border-stroke bg-gray-2 p-3 dark:border-strokedark dark:bg-graydark">
            <p className="mb-1 text-xs text-bodydark2">발급된 제휴 링크</p>
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
                  ? '세션 유효 — ?af 제휴 링크 발급 가능'
                  : '세션 없음/만료 — 아래에서 로그인 curl을 저장해야 합니다'}
              </span>
            </div>
            <p className="mt-2 text-xs text-bodydark2">
              세션이 없으면 기존처럼 일반 ozip.me(수익 없음)만 나갑니다.
            </p>
          </>
        )}
      </div>

      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">curl 얻는 법</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-bodydark2">
          <li>
            <a
              href="https://ohou.se"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              ohou.se
            </a>{' '}
            에 큐레이터 계정으로 로그인
          </li>
          <li>상품 페이지에서 공유하기 → URL 공유 (주소 끝에 ?af 확인)</li>
          <li>
            DevTools(F12) → Network에서{' '}
            <code className="rounded bg-gray-2 px-1 dark:bg-graydark">sharelink</code> 요청 Copy as
            cURL
          </li>
          <li>아래에 붙여넣으면 userId만 칸에 남습니다</li>
        </ol>
      </div>

      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">세션 갱신</h3>
        <textarea
          value={display}
          onChange={(e) => setDisplay(e.target.value)}
          onPaste={handlePaste}
          placeholder="여기에 sharelink curl 붙여넣기 — userId만 표시됩니다"
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

export default OhouSessionPanel;
