'use client';

import { useState } from 'react';

import Panel from '@/components/Panel';
import {
  useMutationIssueKakaoProfitLink,
  useMutationIssueOhouProfitLink,
  useMutationIssueTossProfitLink,
} from '@/hooks/graphql/profitLink';

import { detectIssueProvider, ISSUE_PROVIDER_LABEL } from '../lib/detect-issue-provider';

import {
  KakaoSessionCard,
  NaverBcSessionCard,
  OhouSessionCard,
  ThreeHaSessionCard,
  TossSessionCard,
} from './SessionCards';

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
      <Panel rounded="sm" className="p-4 sm:p-6">
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
          className="mb-3 w-full rounded-sm border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-hidden focus:border-primary dark:border-strokedark dark:text-white"
        />
        {detected && (
          <p className="mb-3 text-xs text-bodydark2">
            {ISSUE_PROVIDER_LABEL[detected]} 채널로 발급합니다.
          </p>
        )}
        <button
          onClick={handleIssue}
          disabled={issuing}
          className="w-full rounded-sm bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
        >
          {issuing ? '발급 중...' : '수익링크 발급'}
        </button>

        {issuedLink && (
          <div className="mt-4 rounded-sm border border-stroke bg-gray-2 p-3 dark:border-strokedark dark:bg-graydark">
            <p className="mb-1 text-xs text-bodydark2">발급된 수익링크</p>
            <div className="flex items-center gap-2">
              <a
                href={issuedLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 font-mono text-sm break-all text-primary underline"
              >
                {issuedLink}
              </a>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-sm border border-stroke px-3 py-2 text-xs text-black hover:bg-white md:py-1 dark:border-strokedark dark:text-white dark:hover:bg-boxdark"
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          </div>
        )}
        {issueError && <p className="mt-3 text-sm text-danger">{issueError}</p>}
      </Panel>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">세션 갱신</h3>
        <p className="mb-4 text-xs text-bodydark2">
          만료되면 해당 채널 발급이 멈춥니다. 붙여넣기 칸에는 토큰/쿠키 원문이 아니라 식별 가능한
          요약만 남깁니다.
        </p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TossSessionCard />
          <NaverBcSessionCard />
          <OhouSessionCard />
          <KakaoSessionCard />
          <ThreeHaSessionCard />
        </div>
      </div>
    </div>
  );
};

export default ProfitLinkOpsPanel;
