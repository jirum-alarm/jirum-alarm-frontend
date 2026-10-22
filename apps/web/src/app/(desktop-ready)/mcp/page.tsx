import { text } from '@jirum/design-system/recipes';
import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';

import DealsMobileHeader from '../deals/[slug]/DealsMobileHeader';

/**
 * AI 비서(Claude·ChatGPT)에 지름알림 MCP 를 붙이는 법. 지름알림 계정 로그인(OAuth)이 필요하다 — 처음 연결할 때 로그인 창이 뜨고
 * 동의 화면은 /mcp/authorize. MCP 는 사람이 주소를 직접 붙여야 쓰여서 이 안내가 입구다.
 * 메뉴 이름은 Claude·ChatGPT 도움말 기준(2026-10-23) — 바뀌면 같이 고칠 것.
 */
const PATH = '/mcp';
const MCP_URL = 'https://mcp.jirum-alarm.com/mcp';
const title = 'AI 비서에서 지름알림 쓰기 — Claude·ChatGPT 연결(MCP) | 지름알림';
const description =
  'Claude·ChatGPT 에 지름알림을 연결하면 «이거 지금 사도 돼?»에 커뮤니티 핫딜 90일 기록으로 답해요. 좋은 가격, 그 가격이 얼마나 자주 오는지, 지금 올라온 핫딜까지 알려 주고, «싸지면 알려줘»라고 하면 내 계정에 가격 알림도 걸어요.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${METADATA_SERVICE_URL}${PATH}` },
  openGraph: { title, description, url: `${METADATA_SERVICE_URL}${PATH}`, type: 'article' },
};

const CLIENTS = [
  {
    name: 'Claude (웹·데스크톱)',
    steps: [
      '설정 → 커넥터에서 «커스텀 커넥터 추가»를 눌러요.',
      '이름은 «지름알림», 주소엔 아래 MCP 주소를 붙이고 추가해요.',
      '«연결»을 누르면 지름알림 로그인 창이 떠요 — 로그인하고 «허용»을 누르면 끝이에요.',
      '대화창의 «+» → 커넥터에서 지름알림을 켜요. 무료 플랜도 커스텀 커넥터 1개를 쓸 수 있어요.',
    ],
  },
  {
    name: 'ChatGPT (웹)',
    steps: [
      '설정 → 앱 → 고급 설정에서 «개발자 모드»를 켜요(Plus·Pro 등 유료 플랜).',
      '«앱 만들기»를 눌러 아래 MCP 주소를 붙이고, 인증은 «OAuth»로 둬요.',
      '지름알림 로그인 창에서 로그인하고 «허용»을 눌러요.',
      '대화에서 지름알림을 골라 물어봐요.',
    ],
  },
];

const EXAMPLES = [
  '삼다수 2L 지금 사도 돼?',
  '에어팟 프로3 핫딜 보통 얼마에 떠?',
  '햇반 210g 좋은 가격이 얼마야?',
  '기저귀 싸지면 알려줘',
  '내 지름알림 알림 목록 보여줘',
];

export default function McpGuidePage() {
  return (
    <main className="max-w-mobile-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <DealsMobileHeader title="AI 비서에서 쓰기" />

      <article className="text-15 space-y-10 leading-relaxed text-gray-800">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">AI 비서에서 지름알림 쓰기</h1>
          <p className="mt-3">
            Claude·ChatGPT 에 지름알림을 연결하면 «이거 지금 사도 돼?»라고 물었을 때, 같은 상품이
            지난 90일 동안 커뮤니티 핫딜로 올라온 가격을 보고 답해요. 좋은 가격(싼 쪽 20%)이
            얼마인지, 그 가격이 얼마나 자주 오는지, 지금 올라온 핫딜이 있는지까지 알려 주고, 답마다
            지름알림 링크가 붙어 바로 확인할 수 있어요. «싸지면 알려줘»라고 하면 내 지름알림 계정에
            가격 알림을 걸어 앱·웹 푸시로 받을 수 있어요. 처음 연결할 때 지름알림 계정으로 한 번
            로그인해요.
          </p>
        </header>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>MCP 주소</h2>
          <p className="rounded-xl bg-gray-100 px-4 py-3 font-mono text-sm break-all select-all">
            {MCP_URL}
          </p>
        </section>

        {CLIENTS.map((c) => (
          <section key={c.name}>
            <h2 className={cn(text.title, 'mb-3')}>{c.name}</h2>
            <ol className="list-decimal space-y-2 pl-5">
              {c.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        ))}

        <section>
          <h2 className={cn(text.title, 'mb-3')}>Claude Code</h2>
          <p className="rounded-xl bg-gray-100 px-4 py-3 font-mono text-sm break-words select-all">
            claude mcp add --transport http jirum-alarm{' '}
            <span className="whitespace-nowrap">{MCP_URL}</span>
          </p>
          <p className={cn(text.muted, 'mt-3')}>
            추가한 뒤 Claude Code 에서 /mcp 를 열어 지름알림을 고르면 로그인 창이 떠요.
          </p>
        </section>

        <section>
          <h2 className={cn(text.title, 'mb-3')}>이렇게 물어보세요</h2>
          <ul className="list-disc space-y-2 pl-5">
            {EXAMPLES.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p className={cn(text.muted, 'mt-3')}>
            모델명·용량까지 말할수록 정확해요. 여러 상품이 섞이는 말(«노트북»)은 좋은 가격 대신 지금
            올라온 핫딜만 알려 드려요. 메뉴 이름은 각 서비스 사정에 따라 바뀔 수 있어요.
          </p>
        </section>
      </article>
    </main>
  );
}
