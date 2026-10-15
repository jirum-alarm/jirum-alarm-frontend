import { hasPriceVerdict, headline, unitPriceText, watchCondition } from '../model/copy';

import WaitChart from './WaitChart';
import WatchButton from './WatchButton';

import type { WaitDeal, WaitEstimate } from '../model/types';

const WEB_ORIGIN = 'https://jirum-alarm.com';

const TONE = {
  buy: 'bg-success-50 text-success-700',
  wait: 'bg-secondary-50 text-secondary-700',
  rare: 'bg-warning-50 text-warning-700',
  unknown: 'bg-gray-100 text-gray-700',
} as const;

const TONE_LABEL = {
  buy: '지금 사도 좋아요',
  wait: '기다려요',
  rare: '드물어요',
  unknown: '판단 보류',
} as const;

const ago = (iso: string, now: number) => {
  const d = Math.floor((now - Date.parse(iso)) / 86_400_000);
  return d <= 0 ? '오늘' : d === 1 ? '어제' : `${d}일 전`;
};

function DealRow({ deal, unit, now }: { deal: WaitDeal; unit: WaitEstimate['unit']; now: number }) {
  return (
    <li>
      <a
        href={`${WEB_ORIGIN}/products/${deal.id}`}
        className="tappable flex items-center gap-3 py-2.5 active:bg-gray-50"
      >
        <span className="min-w-0 flex-1">
          <span className="text-13 line-clamp-1 text-gray-900">{deal.title}</span>
          <span className="text-11 text-gray-500">
            {ago(deal.postedAt, now)}
            {deal.isEnd ? ' · 종료' : ''}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="text-13 block font-bold text-gray-900 tabular-nums">
            {deal.price.toLocaleString('ko-KR')}원
          </span>
          {unit !== 'TOTAL' && (
            <span className="text-11 block text-gray-500 tabular-nums">
              {unitPriceText(unit, deal.unitPrice)}
            </span>
          )}
        </span>
      </a>
    </li>
  );
}

/**
 * 「언제 사나」 답. 순서 = 판정 한 줄 → 근거(점 차트) → 할 일(알림) → 증거(딜 목록) → 조건(어떻게 골랐나).
 * 조건을 맨 아래에 숨기지 않고 보여 주는 이유: 키워드·제외어·단위가 틀리면 답 전체가 틀린다 — 사용자가 확인할 수 있어야 한다.
 */
export default function WaitResult({ estimate: e, now }: { estimate: WaitEstimate; now: number }) {
  const h = headline(e, now);
  const widened = e.candidates[0] && e.candidates[0].keyword !== e.keyword;
  const watch = watchCondition(e);
  const priced = hasPriceVerdict(e);

  return (
    <div className="flex flex-col gap-4 pb-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <span className={`text-11 inline-block rounded-full px-2 py-0.5 font-bold ${TONE[h.tone]}`}>
          {TONE_LABEL[h.tone]}
        </span>
        <h1 className="text-22 mt-2 leading-snug font-bold text-gray-900">{h.title}</h1>
        <p className="text-13 mt-1.5 leading-relaxed text-gray-600">{h.sub}</p>

        {e.points.length >= 2 && (
          <div className="mt-5">
            <WaitChart
              points={e.points}
              unit={e.unit}
              goodPrice={priced ? e.goodPrice : null}
              windowDays={e.windowDays}
              now={now}
            />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <WatchButton condition={watch} label={e.label} priced={priced} />
        <p className="text-11 text-center leading-relaxed text-gray-500">
          {watch.maxPrice != null
            ? `${watch.maxPrice.toLocaleString('ko-KR')}원 이하 「${e.keyword}」 딜만 알려 드려요 — 지난 ${e.windowDays}일이면 ${e.goodDealCount}번`
            : priced
              ? `지금은 「${e.keyword}」 새 딜마다 알려 드려요(지난 ${e.windowDays}일 약 ${e.rawMatchCount}번). 단위가 조건이 붙으면 ${e.goodDealCount}번으로 줄어요 — 준비 중`
              : `「${e.keyword}」 새 딜마다 알려 드려요(지난 ${e.windowDays}일 약 ${e.rawMatchCount}번)`}
        </p>
      </section>

      {e.liveDeals.length > 0 && (
        <section className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
          <h2 className="text-15 font-bold text-gray-900">지금 진행 중</h2>
          <ul className="divide-y divide-gray-100">
            {e.liveDeals.map((d) => (
              <DealRow key={d.id} deal={d} unit={e.unit} now={now} />
            ))}
          </ul>
        </section>
      )}

      {priced && e.goodDeals.length > 0 && (
        <section className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
          <h2 className="text-15 font-bold text-gray-900">최근 좋은 가격 딜</h2>
          <ul className="divide-y divide-gray-100">
            {e.goodDeals.map((d) => (
              <DealRow key={d.id} deal={d} unit={e.unit} now={now} />
            ))}
          </ul>
        </section>
      )}

      <section className="text-11 rounded-2xl bg-gray-50 px-4 py-3 leading-relaxed text-gray-500">
        <p>
          <b className="text-gray-700">이렇게 골랐어요</b> · 최근 {e.windowDays}일 커뮤니티 핫딜 중
          「{e.keyword}」
          {e.excludeKeywords.length > 0 && ` (빼기: ${e.excludeKeywords.join(', ')})`}
          {e.priceFloor != null && ` · ${e.priceFloor.toLocaleString('ko-KR')}원 이상`}
          {e.priceCeiling != null && ` · ${e.priceCeiling.toLocaleString('ko-KR')}원 이하`} ·{' '}
          {e.dealCount}건
        </p>
        {widened && (
          <p className="mt-1">
            「{e.candidates[0].keyword}」 딜은 {e.candidates[0].dealCount}건뿐이라 「{e.keyword}」
            전체로 넓혀 봤어요.
          </p>
        )}
      </section>
    </div>
  );
}
