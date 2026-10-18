'use client';

import { type ReactNode } from 'react';

import {
  useMutationSetKakaoSession,
  useMutationSetNaverBcSession,
  useMutationSetOhouSession,
  useMutationSetThreeHaSession,
  useMutationSetTossSession,
  useQueryHasKakaoSession,
  useQueryHasNaverBcSession,
  useQueryHasOhouSession,
  useQueryHasThreeHaSession,
  useQueryHasTossSession,
} from '@/hooks/graphql/profitLink';

import { useSessionForm } from '../hooks/useSessionForm';
import { kakaoSessionSummary, parseKakaoSession } from '../lib/parse-kakao-session';
import { naverBcCookieSummary, parseNaverBcCookie } from '../lib/parse-naver-bc-cookie';
import { parseOhouSession } from '../lib/parse-ohou-session';
import { parseThreeHaRefreshCookie, threeHaSessionSummary } from '../lib/parse-threeha-refresh';
import { parseTossTbizAuth } from '../lib/parse-toss-tbizauth';

import SessionRefreshCard from './SessionRefreshCard';

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-sm bg-gray-2 px-1 dark:bg-graydark">{children}</code>
);

const LoginLink = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
    {label}
  </a>
);

const Steps = ({ children }: { children: ReactNode }) => (
  <ol className="list-decimal space-y-1 pl-4">{children}</ol>
);

export const TossSessionCard = () => {
  const { data, loading, refetch } = useQueryHasTossSession();
  const form = useSessionForm({
    parse: (raw) => {
      const token = parseTossTbizAuth(raw);
      return token ? { payload: token, display: token } : null;
    },
    pasteError: 'TBIZAUTH를 찾지 못했습니다.',
    pasteOk: (raw, token) =>
      token !== raw.trim() ? 'TBIZAUTH만 추출했습니다. 저장을 누르면 반영됩니다.' : null,
    emptyError: 'TBIZAUTH 값을 입력해주세요.',
    savedText: '토스 세션이 갱신되었습니다.',
    saveFailText: '저장에 실패했습니다. TBIZAUTH를 확인해주세요.',
  });
  const [save, { loading: saving }] = useMutationSetTossSession({
    onCompleted: (res) => form.onSaved(res.setTossSession, refetch),
    onError: form.onSaveError,
  });

  return (
    <SessionRefreshCard
      value={form.value}
      onChange={form.onChange}
      onPaste={form.onPaste}
      message={form.message}
      title="토스"
      hasSession={data?.hasTossSession}
      statusLoading={loading}
      okText="유효"
      badText="없음/만료"
      howTo={
        <Steps>
          <li>
            <LoginLink href="https://sharelink.toss.im" label="sharelink.toss.im" /> 파트너 로그인
          </li>
          <li>
            DevTools → Cookies의 <Code>TBIZAUTH</Code>, 또는 Network 요청 Copy as cURL
          </li>
        </Steps>
      }
      placeholder="curl 또는 Cookie 붙여넣기 — TBIZAUTH만 표시됩니다"
      onSave={() => {
        const token = form.takePayload();
        if (token) save({ variables: { token } });
      }}
      saving={saving}
    />
  );
};

export const NaverBcSessionCard = () => {
  const { data, loading, refetch } = useQueryHasNaverBcSession();
  const form = useSessionForm({
    parse: (raw) => {
      const cookie = parseNaverBcCookie(raw);
      return cookie ? { payload: cookie, display: naverBcCookieSummary(cookie) } : null;
    },
    pasteError: 'NID_AUT·NID_SES 쿠키를 찾지 못했습니다(로그인 상태?).',
    pasteOk: () => '쿠키는 표시하지 않습니다. 저장을 누르면 반영됩니다.',
    emptyError: 'NID_AUT·NID_SES 가 든 Cookie 를 붙여넣어 주세요.',
    savedText: '네이버 브랜드커넥트 세션이 갱신되었습니다.',
    saveFailText: '저장에 실패했습니다.',
  });
  const [save, { loading: saving }] = useMutationSetNaverBcSession({
    onCompleted: (res) => form.onSaved(res.setNaverBcSession, refetch),
    onError: form.onSaveError,
  });

  return (
    <SessionRefreshCard
      value={form.value}
      onChange={form.onChange}
      onPaste={form.onPaste}
      message={form.message}
      title="네이버 브랜드커넥트"
      hasSession={data?.hasNaverBcSession}
      statusLoading={loading}
      okText="있음"
      badText="없음/만료"
      howTo={
        <Steps>
          <li>
            <LoginLink href="https://brandconnect.naver.com" label="brandconnect.naver.com" />{' '}
            로그인
          </li>
          <li>
            Network 아무 요청 Copy as cURL (또는 Cookie 헤더 원문 — <Code>NID_AUT</Code>·
            <Code>NID_SES</Code> 포함). 자동 갱신이 없어 만료되면 다시 넣어야 한다. 네이버 링크
            발급·스토어 피드·판매 수집이 함께 쓴다.
          </li>
        </Steps>
      }
      placeholder="curl 또는 Cookie 헤더 붙여넣기 — 길이만 표시됩니다"
      onSave={() => {
        const cookie = form.takePayload();
        if (cookie) save({ variables: { cookie } });
      }}
      saving={saving}
    />
  );
};

export const OhouSessionCard = () => {
  const { data, loading, refetch } = useQueryHasOhouSession();
  const form = useSessionForm({
    // 서버가 curl 원문에서 cookie·userId 를 다시 뽑는다 — 저장 값은 원문 그대로
    parse: (raw) => {
      const parsed = parseOhouSession(raw);
      return parsed ? { payload: raw, display: `userId=${parsed.userId}` } : null;
    },
    pasteError: 'cookie와 userId를 찾지 못했습니다.',
    pasteOk: (raw) =>
      `userId ${parseOhouSession(raw)?.userId}만 표시합니다. 저장을 누르면 반영됩니다.`,
    emptyError: '로그인 sharelink curl을 붙여넣어 주세요.',
    savedText: '큐레이터 세션이 갱신되었습니다.',
    saveFailText: '저장 실패. 로그인 sharelink curl인지 확인해주세요.',
  });
  const [save, { loading: saving }] = useMutationSetOhouSession({
    onCompleted: (res) => form.onSaved(res.setOhouSession, refetch),
    onError: form.onSaveError,
  });

  return (
    <SessionRefreshCard
      value={form.value}
      onChange={form.onChange}
      onPaste={form.onPaste}
      message={form.message}
      title="오늘의집"
      hasSession={data?.hasOhouSession}
      statusLoading={loading}
      okText="유효"
      badText="없음/만료"
      howTo={
        <Steps>
          <li>
            <LoginLink href="https://ohou.se" label="ohou.se" /> 큐레이터 로그인
          </li>
          <li>상품 공유하기 → Network의 sharelink 요청 Copy as cURL</li>
        </Steps>
      }
      placeholder="sharelink curl 붙여넣기 — userId만 표시됩니다"
      onSave={() => {
        const curl = form.takePayload();
        if (curl) save({ variables: { curl } });
      }}
      saving={saving}
    />
  );
};

export const KakaoSessionCard = () => {
  const { data, loading, refetch } = useQueryHasKakaoSession();
  const form = useSessionForm({
    // 서버가 curl 원문에서 쿠키를 다시 뽑는다 — 저장 값은 원문 그대로
    parse: (raw) => {
      const parsed = parseKakaoSession(raw);
      return parsed ? { payload: raw, display: kakaoSessionSummary(parsed) } : null;
    },
    pasteError: '카카오쇼핑 세션 쿠키를 찾지 못했습니다.',
    pasteOk: () => '쿠키는 표시하지 않습니다. 저장을 누르면 반영됩니다.',
    emptyError: '로그인 affiliate-link curl을 붙여넣어 주세요.',
    savedText: '카카오쇼핑 세션이 갱신되었습니다.',
    saveFailText: '저장 실패. affiliate-link curl인지, 로그인이 살아있는지 확인해주세요.',
  });
  const [save, { loading: saving }] = useMutationSetKakaoSession({
    onCompleted: (res) => form.onSaved(res.setKakaoSession, refetch),
    onError: form.onSaveError,
  });

  return (
    <SessionRefreshCard
      value={form.value}
      onChange={form.onChange}
      onPaste={form.onPaste}
      message={form.message}
      title="카카오쇼핑"
      hasSession={data?.hasKakaoSession}
      statusLoading={loading}
      okText="있음"
      badText="없음/만료"
      howTo={
        <Steps>
          <li>
            <LoginLink
              href="https://store.kakao.com/share/ranking"
              label="store.kakao.com/share/ranking"
            />{' '}
            로그인
          </li>
          <li>
            공유하기 → Network의 <Code>affiliate-link</Code> Copy as cURL
          </li>
        </Steps>
      }
      placeholder="affiliate-link curl 붙여넣기 — productId·쿠키 길이만 표시됩니다"
      onSave={() => {
        const curl = form.takePayload();
        if (curl) save({ variables: { curl } });
      }}
      saving={saving}
    />
  );
};

export const ThreeHaSessionCard = () => {
  const { data, loading, refetch } = useQueryHasThreeHaSession();
  const form = useSessionForm({
    parse: (raw) => {
      const cookie = parseThreeHaRefreshCookie(raw);
      return cookie ? { payload: cookie, display: threeHaSessionSummary(cookie) } : null;
    },
    pasteError: 'r 쿠키(JWT)를 찾지 못했습니다.',
    pasteOk: () => 'r 쿠키만 추출했습니다. 저장을 누르면 반영됩니다.',
    emptyError: 'r 쿠키 값을 입력해주세요.',
    savedText: '세시간전 세션이 갱신되었습니다.',
    saveFailText: '저장에 실패했습니다. r 쿠키를 확인해주세요.',
  });
  const [save, { loading: saving }] = useMutationSetThreeHaSession({
    onCompleted: (res) => form.onSaved(res.setThreeHaSession, refetch),
    onError: form.onSaveError,
  });

  return (
    <SessionRefreshCard
      value={form.value}
      onChange={form.onChange}
      onPaste={form.onPaste}
      message={form.message}
      title="세시간전 (운영 중단)"
      hasSession={data?.hasThreeHaSession}
      statusLoading={loading}
      okText="있음"
      badText="없음"
      howTo={
        <Steps>
          <li>
            <LoginLink href="https://3hoursahead.com" label="3hoursahead.com" /> 구글 로그인
          </li>
          <li>
            DevTools → Cookies의 <Code>r</Code> 값, 또는 API 요청 Copy as cURL. 7일 만료.
          </li>
        </Steps>
      }
      placeholder="curl 또는 r 쿠키 붙여넣기 — JWT 길이만 표시됩니다"
      onSave={() => {
        const cookie = form.takePayload();
        if (cookie) save({ variables: { cookie } });
      }}
      saving={saving}
    />
  );
};
