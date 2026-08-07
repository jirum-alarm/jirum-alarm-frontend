import type { PricePosition as Position } from '../model/types';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/**
 * "지금 사도 되나" 카드.
 *
 * ★이 카드의 카피는 **confidence 로 갈린다.** 실측(2026-08-07, 운영 300건)에서
 * HIGH 는 0.7% 뿐이고 나머지는 유사상품 추정(LOW)이다. 둘을 같은 말투로 쓰면
 * 99.3% 의 추정을 확신으로 팔게 된다 — 이 앱의 정직성 경계가 무너지는 지점.
 *
 * - HIGH: "역대 딜 중 싼 편" — 같은 상품이 확인된 것이라 단정한다
 * - LOW : "비슷한 상품 기준" — 추정임을 문장 안에 박고, 판정어를 약하게 쓴다
 */
const COPY: Record<Position['verdict'], { high: string; low: string; tone: string }> = {
  cheap: {
    high: '역대 딜 중 싼 편이에요',
    low: '비슷한 상품보다 싼 편으로 보여요',
    tone: 'text-error-600',
  },
  normal: {
    high: '평소 가격대예요',
    low: '비슷한 상품과 비슷해 보여요',
    tone: 'text-gray-800',
  },
  pricey: {
    high: '역대 딜 중 비싼 편이에요',
    low: '비슷한 상품보다 비싼 편으로 보여요',
    tone: 'text-gray-800',
  },
};

export default function PricePosition({ position, title }: { position: Position; title: string }) {
  const { min, max, price, sampleSize, percentile, verdict, confidence } = position;
  const copy = COPY[verdict];
  const high = confidence === 'HIGH';

  // 막대 위 현재가 위치. 최저=0% 최고=100%.
  const span = max - min;
  const left = span > 0 ? ((price - min) / span) * 100 : 50;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-gray-900">지금 사도 되나</span>
        <span className="shrink-0 text-[11px] text-gray-500 tabular-nums">
          과거 딜 {sampleSize}개
        </span>
      </div>

      <p className={`text-[15px] font-bold ${copy.tone}`}>{high ? copy.high : copy.low}</p>
      <p className="mt-1 text-[13px] text-gray-600">
        지금 <b className="tabular-nums">{won(price)}</b> · 과거는{' '}
        <span className="tabular-nums">
          {won(min)}~{won(max)}
        </span>
      </p>

      {/* 막대: 과거 범위 안에서 현재가가 어디인지. 20배 스프레드여도 상대 위치는 읽힌다 */}
      <div className="relative mt-3 h-1.5 rounded-full bg-gray-100">
        <div
          className={`absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-2 border-white ${
            verdict === 'cheap' ? 'bg-error-600' : 'bg-gray-700'
          }`}
          style={{ left: `${Math.min(100, Math.max(0, left))}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-gray-500">
        <span>최저</span>
        <span>최고</span>
      </div>
      <p className="sr-only">
        과거 딜 {sampleSize}개 중 하위 {Math.round(percentile * 100)}% 위치
      </p>

      {/*
       * LOW 면 근거의 한계를 **카드 안에** 적는다. 툴팁이나 접힌 영역에 숨기면
       * 판정만 읽고 넘어간다 — 백엔드 disclaimer 와 같은 취지.
       */}
      {!high && (
        <p className="mt-2.5 text-[11px] leading-snug text-gray-500">
          같은 상품 이력이 없어서 이름·가격대가 비슷한 딜로 비교했어요. 규격이 다를 수 있어요.
        </p>
      )}
      {high && (
        <p className="mt-2.5 truncate text-[11px] leading-snug text-gray-500" title={title}>
          기준: {title}
        </p>
      )}
    </div>
  );
}
