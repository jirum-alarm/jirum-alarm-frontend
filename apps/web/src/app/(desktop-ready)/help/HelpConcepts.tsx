import { infoBox, wordTag } from '@jirum/design-system/recipes';
import { DAILY_COMMUNITY_DEALS } from '@jirum/domain/service-facts';

import { cn } from '@/shared/lib/cn';

import HelpIcon, { type HelpIconName } from './HelpIcons';

/**
 * 핵심 개념 세 가지(진짜 싼지 · 한곳에 모아 · 원하는 것만 알림)를 그림으로 푼다.
 *
 * 왜(2026-10-19 "핵심 개념은 더 친절하고 자세히 시각화해서 가치를 직관적으로"): 전엔 차별점이 아이콘 카드 4장의
 * 글뿐이라, 상세 「지름알림이 가격을 판단하는 법」(/help#evidence — 웹·앱 상세 둘 다)으로 온 사람이 접힌 질문 한 줄을
 * 받았다. 이제 그 앵커가 「가격 자」 그림으로 바로 떨어진다.
 *
 * 그림의 숫자는 전부 예시라 「예시」를 붙인다. 판정 종류(지난 핫딜가·쇼핑몰 가격·커뮤니티 반응)는 서버
 * dealEvidence kind(HISTORY·MARKET·COMMUNITY)와 같다 — 종류가 바뀌면 같이 고칠 것.
 * 위치는 inline style 의 % — 눈금 간격 토큰이 아니라 값(가격)에 비례하는 자리라서.
 */

function ExampleTag() {
  return (
    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500">
      예시
    </span>
  );
}

function ConceptHeader({
  id,
  step,
  icon,
  tone,
  title,
  lead,
}: {
  id: string;
  step: number;
  icon: HelpIconName;
  tone: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tone)}>
        <HelpIcon name={icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500">핵심 {step}</p>
        <h3 id={`${id}-title`} className="pc:text-xl mt-0.5 text-lg font-bold text-gray-900">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{lead}</p>
      </div>
    </div>
  );
}

/* ───────── 1. 진짜 싼지 — 가격 자 ───────── */

// 원 단위 예시. 자의 왼쪽 끝 = 싸다.
const RULER_MIN = 11_000;
const RULER_MAX = 19_000;
const pos = (won: number) => `${((won - RULER_MIN) / (RULER_MAX - RULER_MIN)) * 100}%`;
const PAST_DEALS = [
  13_400, 13_900, 14_200, 14_500, 14_900, 15_000, 15_300, 15_500, 15_900, 16_200, 16_500, 16_900,
  17_400, 12_600,
];
const NOW = 12_900;
const USUAL = 16_000;
const MARKETS = [
  { name: '다나와 최저가', won: 17_800 },
  { name: '쿠팡', won: 18_400 },
];

const EVIDENCE_KINDS: { icon: HelpIconName; tone: string; name: string; text: string }[] = [
  {
    icon: 'chart',
    tone: 'bg-error-50 text-error-600',
    name: '지난 핫딜가',
    text: '같은 상품이 지난 1년 동안 핫딜로 올라온 가격과 비교해요. 「보통가보다 3,100원 싸요」처럼요.',
  },
  {
    icon: 'tag',
    tone: 'bg-secondary-50 text-secondary-600',
    name: '쇼핑몰 가격',
    text: '다나와 최저가, 쿠팡의 같은 상품 가격과 비교해요. 다나와가 더 싸면 그것도 그대로 알려드려요.',
  },
  {
    icon: 'chat',
    tone: 'bg-success-50 text-success-700',
    name: '커뮤니티 반응',
    text: '가격 기록이 없을 땐 인기글 여부, 「싸다」「샀다」 댓글처럼 먼저 본 사람들의 반응을 근거로 써요.',
  },
];

function PriceRuler() {
  return (
    <figure data-nosnippet className="shadow-card pc:p-6 rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">제주 삼다수 2L 24병</p>
        <ExampleTag />
      </div>

      {/* 자: 위에 지금 가격 핀, 가운데 지난 핫딜 점, 아래 쇼핑몰 가격 눈금. */}
      <div className="relative mx-2 mt-12 mb-24">
        <div className="absolute -top-11 -translate-x-1/2 text-center" style={{ left: pos(NOW) }}>
          <span className="bg-error-600 text-fixed-white block rounded-lg px-2 py-1 text-xs font-bold whitespace-nowrap">
            지금 12,900원
          </span>
          <span aria-hidden className="bg-error-600 mx-auto block h-3 w-0.5" />
        </div>

        <div className="h-2 rounded-full bg-gray-100" />
        {PAST_DEALS.map((won, i) => (
          <span
            key={i}
            aria-hidden
            className="bg-secondary-400 absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
            style={{ left: pos(won) }}
          />
        ))}
        <span
          aria-hidden
          className="absolute -top-1.5 h-5 w-0.5 -translate-x-1/2 bg-gray-700"
          style={{ left: pos(USUAL) }}
        />

        {MARKETS.map((m) => (
          <span
            key={m.name}
            aria-hidden
            className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 bg-gray-400"
            style={{ left: pos(m.won) }}
          />
        ))}
        {[{ name: '보통가', won: USUAL }, ...MARKETS].map((m, i) => (
          <span
            key={m.name}
            className={cn(
              'absolute text-xs leading-tight whitespace-nowrap text-gray-500',
              // 다나와·쿠팡은 값이 붙어 있어 겹친다 — 줄을 나누고 눈금 왼쪽으로 붙인다.
              [
                '-top-10 -translate-x-1/2 text-center',
                'top-5 -translate-x-full text-right',
                'top-14 -translate-x-full text-right',
              ][i],
            )}
            style={{ left: pos(m.won) }}
          >
            {m.name}
            <b className="block font-semibold text-gray-700">{m.won.toLocaleString()}원</b>
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>← 쌀수록</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="bg-secondary-400 size-2.5 rounded-full opacity-70" />
          지난 1년 핫딜 14건
        </span>
        <span>비쌀수록 →</span>
      </div>

      <div className={cn('mt-4 flex gap-2.5 px-4 py-3', infoBox)}>
        <span className="bg-error-50 text-error-600 flex size-7 shrink-0 items-center justify-center rounded-full">
          <HelpIcon name="tag" className="size-4" />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-900">
            보통가보다 <b className="text-error-600 font-bold">3,100원</b> 싸요 (19%)
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            좋은 딜 · 지난 1년 핫딜 14건 중 85%보다 싸요
          </p>
        </div>
      </div>
      <figcaption className="mt-2.5 text-center text-xs text-gray-500">
        이 그림을 한 줄로 줄인 게 상품 가격 바로 아래 「왜 핫딜인지」 칸이에요
      </figcaption>
    </figure>
  );
}

function EvidenceConcept() {
  return (
    <section id="evidence" aria-labelledby="evidence-title" className="scroll-mt-20">
      <ConceptHeader
        id="evidence"
        step={1}
        icon="tag"
        tone="bg-error-50 text-error-600"
        title="「싸다」는 말 대신, 비교한 숫자를 보여드려요"
        lead="커뮤니티 핫딜은 올린 사람의 「싸다」에서 시작해요. 지름알림은 그 가격을 같은 상품의 다른 가격들 옆에 놓아 보고, 정말 싼 쪽에 있을 때만 근거를 붙여요."
      />
      <div className="pc:grid pc:grid-cols-[1fr_260px] pc:gap-5 mt-5">
        <PriceRuler />
        <div className="pc:mt-0 mt-4">
          <p className="mb-2.5 text-sm font-semibold text-gray-500">무엇과 비교하나요?</p>
          <ul className="space-y-2">
            {EVIDENCE_KINDS.map((k) => (
              <li key={k.name} className="flex gap-3 rounded-2xl bg-gray-50 p-3.5">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    k.tone,
                  )}
                >
                  <HelpIcon name={k.icon} className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{k.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{k.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="pc:grid-cols-2 mt-4 grid gap-2 text-sm">
        <li className="flex gap-2 rounded-2xl border border-gray-100 p-3.5 text-gray-700">
          <span aria-hidden className="text-success-700 font-bold">
            ✓
          </span>
          근거가 여러 개면 가장 확실한 하나만 보여드려요.
        </li>
        <li className="flex gap-2 rounded-2xl border border-gray-100 p-3.5 text-gray-700">
          <span aria-hidden className="text-success-700 font-bold">
            ✓
          </span>
          근거가 없으면 칸을 아예 띄우지 않아요. 억지로 싸다고 하지 않아요.
        </li>
      </ul>
    </section>
  );
}

/* ───────── 2. 한곳에 모아 — 흐름도 ───────── */

const SAMPLE_SOURCES = ['뽐뿌', '에펨코리아', '퀘이사존', '루리웹', '클리앙'];

function GatherConcept({ communityCount }: { communityCount: number }) {
  return (
    <section id="gather" aria-labelledby="gather-title" className="scroll-mt-20">
      <ConceptHeader
        id="gather"
        step={2}
        icon="layers"
        tone="bg-secondary-50 text-secondary-600"
        title={`커뮤니티 ${communityCount}곳을 대신 돌아봐요`}
        lead={`핫딜은 커뮤니티마다 따로 올라와요. 하루 ${DAILY_COMMUNITY_DEALS} 안팎이라 한두 곳만 보면 나머지를 놓쳐요. 지름알림이 모두 읽어 와서 같은 딜은 한 칸으로 접어요.`}
      />
      <figure
        data-nosnippet
        className="pc:grid pc:grid-cols-[1fr_auto_1fr_auto_1fr] pc:items-center pc:gap-3 pc:space-y-0 pc:p-6 mt-5 space-y-2 rounded-2xl bg-gray-50 p-4"
      >
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-semibold text-gray-500">① 여기저기 올라온 글</p>
          <ul className="mt-2 space-y-1.5">
            {SAMPLE_SOURCES.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-xs text-gray-700">
                <span
                  className={cn(
                    wordTag.box,
                    wordTag.text,
                    wordTag.tone.fill.box,
                    wordTag.tone.fill.text,
                  )}
                >
                  {s}
                </span>
                <span className="truncate">{i < 3 ? '삼다수 2L 24병 12,900원' : '…다른 핫딜'}</span>
              </li>
            ))}
          </ul>
        </div>
        <Arrow />
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-semibold text-gray-500">② 같은 상품끼리 묶고</p>
          <p className="mt-2 text-sm text-gray-700">
            같은 딜이 세 곳에 올라왔어요.
            <br />
            <b className="font-semibold text-gray-900">여러 곳이 동시에 올렸다</b>는 것도 좋은 딜의
            신호예요.
          </p>
        </div>
        <Arrow />
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-semibold text-gray-500">③ 한 칸으로 보여드려요</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">삼다수 2L 24병</p>
          <p className="text-error-600 text-base font-bold">12,900원</p>
          <p className="mt-1 text-xs text-gray-500">뽐뿌 외 2곳 · 추천·댓글 반응 · 댓글 요약</p>
        </div>
      </figure>
      <p className="mt-3 text-sm text-gray-600">
        원문 커뮤니티의 반응과 종료 여부도 같이 보여주고, 원문으로 바로 이어져요. 커뮤니티를
        대신하는 게 아니라 여러 곳을 한 번에 읽게 해 드리는 거예요. 토스쇼핑·네이버쇼핑·오늘의집
        특가도 함께 모아요.
      </p>
    </section>
  );
}

function Arrow() {
  return (
    <span aria-hidden className="flex justify-center text-gray-400">
      <span className="pc:hidden">↓</span>
      <span className="pc:inline hidden">→</span>
    </span>
  );
}

/* ───────── 3. 원하는 것만 알림 — 거름망 ───────── */

const FUNNEL: { label: string; detail: string; width: string; tone: string }[] = [
  { label: '하루 핫딜', detail: `약 ${DAILY_COMMUNITY_DEALS}`, width: '100%', tone: 'bg-gray-200' },
  {
    label: '키워드 「콜라」',
    detail: '「콜라」가 들어간 딜만',
    width: '62%',
    tone: 'bg-secondary-100',
  },
  {
    label: '제외 단어 「콜라겐」',
    detail: '콜라겐 영양제는 빼고',
    width: '40%',
    tone: 'bg-secondary-200',
  },
  { label: '가격 범위 ~20,000원', detail: '원하는 가격대만', width: '24%', tone: 'bg-primary-300' },
];

function AlarmConcept({ isApp }: { isApp: boolean }) {
  return (
    <section id="alarm" aria-labelledby="alarm-title" className="scroll-mt-20">
      <ConceptHeader
        id="alarm"
        step={3}
        icon="bell"
        tone="bg-primary-100 text-primary-800"
        title="원하는 것만 걸러서 알려드려요"
        lead="계속 들여다볼 필요 없어요. 키워드를 걸어 두면 모든 커뮤니티를 대신 지켜보다가, 조건에 맞는 딜이 올라오는 순간 알려드려요."
      />
      <figure data-nosnippet className="pc:p-6 mt-5 rounded-2xl bg-gray-50 p-4">
        <div className="flex justify-end">
          <ExampleTag />
        </div>
        <ol className="mt-2 space-y-2">
          {FUNNEL.map((f) => (
            <li key={f.label} className="flex flex-col items-center">
              <div
                className={cn('flex min-h-11 items-center justify-center rounded-xl px-3', f.tone)}
                style={{ width: f.width, minWidth: '11rem' }}
              >
                <span className="text-center text-sm leading-tight font-semibold text-gray-900">
                  {f.label}
                </span>
              </div>
              <span className="mt-0.5 text-xs text-gray-500">{f.detail}</span>
            </li>
          ))}
          <li className="flex flex-col items-center pt-1">
            <div className="shadow-card flex w-full max-w-xs items-center gap-3 rounded-2xl bg-white p-3">
              <span className="bg-primary-500 text-fixed-900 flex size-9 shrink-0 items-center justify-center rounded-xl">
                <HelpIcon name="bell" className="size-4" />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-xs text-gray-500">지름알림 · 방금</p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  「콜라」 코카콜라 제로 355ml 24캔 15,900원
                </p>
              </div>
            </div>
            <span className="mt-1.5 text-xs text-gray-500">내 폰에는 이것만 와요</span>
          </li>
        </ol>
      </figure>

      <div className="pc:grid-cols-3 mt-4 grid gap-2">
        {[
          { k: '20개', v: '키워드는 20개까지' },
          { k: '10개', v: '키워드마다 제외 단어' },
          { k: '21~08시', v: '밤 알림은 동의 안 하면 아침 8시에 모아서' },
        ].map((s) => (
          <div
            key={s.v}
            className="pc:block flex items-center gap-3 rounded-2xl border border-gray-100 p-3.5"
          >
            <strong className="text-lg font-bold text-gray-900">{s.k}</strong>
            <p className="pc:mt-0.5 text-xs text-gray-600">{s.v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-600">
        키워드를 정하기 어렵다면 관심사 알림을 켜 보세요. 그 관심사에서 반응이 좋은 딜만 하루 최대
        3건 보내드려요. 키워드는 {isApp ? '내정보' : '마이페이지'} → 키워드 알림에서 걸 수 있어요.
      </p>
    </section>
  );
}

export default function HelpConcepts({
  communityCount,
  isApp,
}: {
  communityCount: number;
  isApp: boolean;
}) {
  return (
    <div className="pc:space-y-16 space-y-12">
      <EvidenceConcept />
      <GatherConcept communityCount={communityCount} />
      <AlarmConcept isApp={isApp} />
    </div>
  );
}
