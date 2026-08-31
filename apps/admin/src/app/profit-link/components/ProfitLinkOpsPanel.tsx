'use client';

import { type ClipboardEvent, useState } from 'react';

import {
  useMutationIssueKakaoProfitLink,
  useMutationIssueOhouProfitLink,
  useMutationIssueTossProfitLink,
  useMutationSetKakaoSession,
  useMutationSetOhouSession,
  useMutationSetThreeHaSession,
  useMutationSetTossSession,
  useQueryHasKakaoSession,
  useQueryHasOhouSession,
  useQueryHasThreeHaSession,
  useQueryHasTossSession,
} from '@/hooks/graphql/profitLink';

import { detectIssueProvider, ISSUE_PROVIDER_LABEL } from '../lib/detect-issue-provider';
import { kakaoSessionSummary, parseKakaoSession } from '../lib/parse-kakao-session';
import { parseOhouSession } from '../lib/parse-ohou-session';
import { parseThreeHaRefreshCookie, threeHaSessionSummary } from '../lib/parse-threeha-refresh';
import { parseTossTbizAuth } from '../lib/parse-toss-tbizauth';

import SessionRefreshCard from './SessionRefreshCard';

type Flash = { type: 'ok' | 'error'; text: string };

const ProfitLinkOpsPanel = () => {
  const [productUrl, setProductUrl] = useState('');
  const [issuedLink, setIssuedLink] = useState<string | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const detected = detectIssueProvider(productUrl);

  const [issueToss, { loading: issuingToss }] = useMutationIssueTossProfitLink({
    onCompleted: (res) => applyIssueResult(res.issueTossProfitLink),
    onError: (e) => applyIssueFailure(e.message),
  });
  const [issueOhou, { loading: issuingOhou }] = useMutationIssueOhouProfitLink({
    onCompleted: (res) => applyIssueResult(res.issueOhouProfitLink),
    onError: (e) => applyIssueFailure(e.message),
  });
  const [issueKakao, { loading: issuingKakao }] = useMutationIssueKakaoProfitLink({
    onCompleted: (res) => applyIssueResult(res.issueKakaoProfitLink),
    onError: (e) => applyIssueFailure(e.message),
  });
  const issuing = issuingToss || issuingOhou || issuingKakao;

  const applyIssueResult = (out: { profitLink?: string | null; error?: string | null }) => {
    if (out.profitLink) {
      setIssuedLink(out.profitLink);
      setIssueError(null);
    } else {
      setIssuedLink(null);
      setIssueError(out.error ?? '발급에 실패했습니다.');
    }
  };
  const applyIssueFailure = (message: string) => {
    setIssuedLink(null);
    setIssueError(message);
  };

  const handleIssue = () => {
    const trimmed = productUrl.trim();
    setCopied(false);
    setIssuedLink(null);
    setIssueError(null);

    if (!trimmed) {
      setIssueError('상품 URL을 입력해주세요.');
      return;
    }
    if (/^\d+$/.test(trimmed)) {
      setIssueError('숫자만 있으면 몰을 구분할 수 없습니다. 전체 상품 URL을 붙여주세요.');
      return;
    }
    const provider = detectIssueProvider(trimmed);
    if (!provider) {
      setIssueError(
        '이 화면은 토스·오늘의집·카카오쇼핑만 수동 발급합니다. 다른 몰은 딜 수집 시 자동 발급됩니다.',
      );
      return;
    }
    if (provider === 'toss') issueToss({ variables: { url: trimmed } });
    else if (provider === 'ohou') issueOhou({ variables: { url: trimmed } });
    else issueKakao({ variables: { url: trimmed } });
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

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">
          상품 URL → 수익링크
        </h3>
        <p className="mb-4 text-xs text-bodydark2">
          토스 / 오늘의집 / 카카오쇼핑 상품 주소를 붙여넣으면 해당 채널로 발급합니다. 딜에는 쓰지
          않고 링크만 돌려줍니다.
        </p>
        <input
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleIssue();
          }}
          placeholder="https://shopping.toss.im/c/… 또는 store.ohou.se/goods/… 또는 store.kakao.com/…/products/…"
          className="mb-3 w-full rounded border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
        />
        {detected && (
          <p className="mb-3 text-xs text-bodydark2">
            {ISSUE_PROVIDER_LABEL[detected]} 채널로 발급합니다.
          </p>
        )}
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

      <div>
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">세션 갱신</h3>
        <p className="mb-4 text-xs text-bodydark2">
          만료되면 해당 채널 발급이 멈춥니다. 붙여넣기 칸에는 토큰/쿠키 원문이 아니라 식별 가능한
          요약만 남깁니다.
        </p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TossSessionCard />
          <OhouSessionCard />
          <KakaoSessionCard />
          <ThreeHaSessionCard />
        </div>
      </div>
    </div>
  );
};

const TossSessionCard = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<Flash | null>(null);
  const { data, loading, refetch } = useQueryHasTossSession();
  const [setSession, { loading: saving }] = useMutationSetTossSession({
    onCompleted: (res) => {
      if (res.setTossSession) {
        setMessage({ type: 'ok', text: '토스 세션이 갱신되었습니다.' });
        setToken('');
        refetch();
      } else {
        setMessage({ type: 'error', text: '저장에 실패했습니다. TBIZAUTH를 확인해주세요.' });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted.trim()) return;
    e.preventDefault();
    const parsed = parseTossTbizAuth(pasted);
    if (!parsed) {
      setToken('');
      setMessage({ type: 'error', text: 'TBIZAUTH를 찾지 못했습니다.' });
      return;
    }
    setToken(parsed);
    setMessage(
      parsed !== pasted.trim()
        ? { type: 'ok', text: 'TBIZAUTH만 추출했습니다. 저장을 누르면 반영됩니다.' }
        : null,
    );
  };

  return (
    <SessionRefreshCard
      title="토스"
      hasSession={data?.hasTossSession}
      statusLoading={loading}
      okText="유효"
      badText="없음/만료"
      howTo={
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <a
              href="https://sharelink.toss.im"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              sharelink.toss.im
            </a>{' '}
            파트너 로그인
          </li>
          <li>
            DevTools → Cookies의{' '}
            <code className="rounded bg-gray-2 px-1 dark:bg-graydark">TBIZAUTH</code>, 또는 Network
            요청 Copy as cURL
          </li>
        </ol>
      }
      placeholder="curl 또는 Cookie 붙여넣기 — TBIZAUTH만 표시됩니다"
      value={token}
      onChange={setToken}
      onPaste={handlePaste}
      onSave={() => {
        const parsed = parseTossTbizAuth(token);
        if (!parsed) {
          setMessage({ type: 'error', text: 'TBIZAUTH 값을 입력해주세요.' });
          return;
        }
        setToken(parsed);
        setMessage(null);
        setSession({ variables: { token: parsed } });
      }}
      saving={saving}
      message={message}
    />
  );
};

const OhouSessionCard = () => {
  const [rawPaste, setRawPaste] = useState('');
  const [display, setDisplay] = useState('');
  const [message, setMessage] = useState<Flash | null>(null);
  const { data, loading, refetch } = useQueryHasOhouSession();
  const [setSession, { loading: saving }] = useMutationSetOhouSession({
    onCompleted: (res) => {
      if (res.setOhouSession) {
        setMessage({ type: 'ok', text: '큐레이터 세션이 갱신되었습니다.' });
        setRawPaste('');
        setDisplay('');
        refetch();
      } else {
        setMessage({ type: 'error', text: '저장 실패. 로그인 sharelink curl인지 확인해주세요.' });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const showParsed = (raw: string) => {
    const parsed = parseOhouSession(raw);
    if (!parsed) {
      setRawPaste('');
      setDisplay('');
      setMessage({ type: 'error', text: 'cookie와 userId를 찾지 못했습니다.' });
      return;
    }
    setRawPaste(raw);
    setDisplay(`userId=${parsed.userId}`);
    setMessage({
      type: 'ok',
      text: `userId ${parsed.userId}만 표시합니다. 저장을 누르면 반영됩니다.`,
    });
  };

  return (
    <SessionRefreshCard
      title="오늘의집"
      hasSession={data?.hasOhouSession}
      statusLoading={loading}
      okText="유효"
      badText="없음/만료"
      howTo={
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <a
              href="https://ohou.se"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              ohou.se
            </a>{' '}
            큐레이터 로그인
          </li>
          <li>상품 공유하기 → Network의 sharelink 요청 Copy as cURL</li>
        </ol>
      }
      placeholder="sharelink curl 붙여넣기 — userId만 표시됩니다"
      value={display}
      onChange={setDisplay}
      onPaste={(e) => {
        const pasted = e.clipboardData.getData('text');
        if (!pasted.trim()) return;
        e.preventDefault();
        showParsed(pasted);
      }}
      onSave={() => {
        const payload = rawPaste || display;
        if (!parseOhouSession(payload)) {
          setMessage({ type: 'error', text: '로그인 sharelink curl을 붙여넣어 주세요.' });
          return;
        }
        setMessage(null);
        setSession({ variables: { curl: payload } });
      }}
      saving={saving}
      message={message}
    />
  );
};

const KakaoSessionCard = () => {
  const [rawPaste, setRawPaste] = useState('');
  const [display, setDisplay] = useState('');
  const [message, setMessage] = useState<Flash | null>(null);
  const { data, loading, refetch } = useQueryHasKakaoSession();
  const [setSession, { loading: saving }] = useMutationSetKakaoSession({
    onCompleted: (res) => {
      if (res.setKakaoSession) {
        setMessage({ type: 'ok', text: '카카오쇼핑 세션이 갱신되었습니다.' });
        setRawPaste('');
        setDisplay('');
        refetch();
      } else {
        setMessage({
          type: 'error',
          text: '저장 실패. affiliate-link curl인지, 로그인이 살아있는지 확인해주세요.',
        });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const showParsed = (raw: string) => {
    const parsed = parseKakaoSession(raw);
    if (!parsed) {
      setRawPaste('');
      setDisplay('');
      setMessage({ type: 'error', text: '카카오쇼핑 세션 쿠키를 찾지 못했습니다.' });
      return;
    }
    setRawPaste(raw);
    setDisplay(kakaoSessionSummary(parsed));
    setMessage({ type: 'ok', text: '쿠키는 표시하지 않습니다. 저장을 누르면 반영됩니다.' });
  };

  return (
    <SessionRefreshCard
      title="카카오쇼핑"
      hasSession={data?.hasKakaoSession}
      statusLoading={loading}
      okText="있음"
      badText="없음/만료"
      howTo={
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <a
              href="https://store.kakao.com/share/ranking"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              store.kakao.com/share/ranking
            </a>{' '}
            로그인
          </li>
          <li>
            공유하기 → Network의{' '}
            <code className="rounded bg-gray-2 px-1 dark:bg-graydark">affiliate-link</code> Copy as
            cURL
          </li>
        </ol>
      }
      placeholder="affiliate-link curl 붙여넣기 — productId·쿠키 길이만 표시됩니다"
      value={display}
      onChange={setDisplay}
      onPaste={(e) => {
        const pasted = e.clipboardData.getData('text');
        if (!pasted.trim()) return;
        e.preventDefault();
        showParsed(pasted);
      }}
      onSave={() => {
        const payload = rawPaste || display;
        if (!parseKakaoSession(payload)) {
          setMessage({ type: 'error', text: '로그인 affiliate-link curl을 붙여넣어 주세요.' });
          return;
        }
        setMessage(null);
        setSession({ variables: { curl: payload } });
      }}
      saving={saving}
      message={message}
    />
  );
};

const ThreeHaSessionCard = () => {
  const [rawPaste, setRawPaste] = useState('');
  const [display, setDisplay] = useState('');
  const [message, setMessage] = useState<Flash | null>(null);
  const { data, loading, refetch } = useQueryHasThreeHaSession();
  const [setSession, { loading: saving }] = useMutationSetThreeHaSession({
    onCompleted: (res) => {
      if (res.setThreeHaSession) {
        setMessage({ type: 'ok', text: '세시간전 세션이 갱신되었습니다.' });
        setRawPaste('');
        setDisplay('');
        refetch();
      } else {
        setMessage({ type: 'error', text: '저장에 실패했습니다. r 쿠키를 확인해주세요.' });
      }
    },
    onError: (e) => setMessage({ type: 'error', text: e.message }),
  });

  const showParsed = (raw: string) => {
    const parsed = parseThreeHaRefreshCookie(raw);
    if (!parsed) {
      setRawPaste('');
      setDisplay('');
      setMessage({ type: 'error', text: 'r 쿠키(JWT)를 찾지 못했습니다.' });
      return;
    }
    setRawPaste(parsed);
    setDisplay(threeHaSessionSummary(parsed));
    setMessage({ type: 'ok', text: 'r 쿠키만 추출했습니다. 저장을 누르면 반영됩니다.' });
  };

  return (
    <SessionRefreshCard
      title="세시간전"
      hasSession={data?.hasThreeHaSession}
      statusLoading={loading}
      okText="있음"
      badText="없음"
      howTo={
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <a
              href="https://3hoursahead.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              3hoursahead.com
            </a>{' '}
            구글 로그인
          </li>
          <li>
            DevTools → Cookies의 <code className="rounded bg-gray-2 px-1 dark:bg-graydark">r</code>{' '}
            값, 또는 API 요청 Copy as cURL. 7일 만료.
          </li>
        </ol>
      }
      placeholder="curl 또는 r 쿠키 붙여넣기 — JWT 길이만 표시됩니다"
      value={display}
      onChange={setDisplay}
      onPaste={(e) => {
        const pasted = e.clipboardData.getData('text');
        if (!pasted.trim()) return;
        e.preventDefault();
        showParsed(pasted);
      }}
      onSave={() => {
        const parsed = parseThreeHaRefreshCookie(rawPaste || display);
        if (!parsed) {
          setMessage({ type: 'error', text: 'r 쿠키 값을 입력해주세요.' });
          return;
        }
        setMessage(null);
        setSession({ variables: { cookie: parsed } });
      }}
      saving={saving}
      message={message}
    />
  );
};

export default ProfitLinkOpsPanel;
