import type { PartialReason, RefusalReason } from '../model/types';

/**
 * 못 답하는 것을 다루는 단일 상태. 빈 화면이 아니라
 * "못하는 것 → 이유 → 대신 있는 것" 구조.
 *
 * 문구가 원인별로 다른 이유: 오염이 원인인데 "표본이 적다"고 말하면
 * 유저는 기다리면 쌓인다고 오해한다.
 */
const copyFor = (reason: PartialReason | RefusalReason): { title: string; detail: string } => {
  switch (reason.code) {
    // ★제목이 곧 원인이어야 한다. 예전엔 POLLUTION·BUNDLE 이 둘 다
    // "시세를 계산하지 않았어요" 라 제목만 스캔하면 두 상황이 구분되지 않았다.
    case 'KEYWORD_POLLUTION':
      return {
        title: '이름만 비슷한 다른 상품이 섞였어요',
        detail: `검색 결과 ${reason.total}개 중 절반 이상이 다른 상품이에요 (${reason.polluted
          .slice(0, 2)
          .map((t) => t.slice(0, 14))
          .join(' · ')} 등). 섞어서 평균을 내면 엉뚱한 값이 나와서, 걸러낸 것만 보여드려요.`,
      };
    case 'MIXED_BUNDLE':
      return {
        title: '묶음 상품이 많아 시세를 못 냈어요',
        detail: `${reason.total}개 중 ${reason.bundleCount}개가 여러 품목을 묶어 파는 딜이에요. 묶음 가격은 단일 상품 시세와 섞을 수 없어서, 단일 상품만 보여드려요.`,
      };
    case 'SMALL_SAMPLE':
      return {
        title: '아직 시세를 말하기엔 딜이 적어요',
        detail: `가격이 있는 딜이 ${reason.sampleSize}개예요. 이 정도로 "보통 얼마"를 말하면 틀리기 쉬워서, 올라온 딜만 그대로 보여드려요.`,
      };
    case 'OUT_OF_WINDOW':
      return {
        title: '역대 최저가는 몰라요',
        detail: `저장된 가격 기록이 최근 ${reason.windowDays}일까지예요. 그 이전은 데이터가 없어요.`,
      };
    case 'NO_COMPARISON':
      return {
        title: '어느 쪽이 낫다고는 말 못해요',
        detail:
          '스펙을 비교할 데이터가 없어요. 각각 자기 시세 안에서 지금이 싼지만 알려드릴 수 있어요.',
      };
    case 'NO_RESULTS':
      return {
        title: '이 검색어로는 딜이 없어요',
        detail: '다른 말로 물어보시거나, 아래 예시를 눌러보세요.',
      };
  }
};

export default function PartialAnswer({
  reason,
  children,
}: {
  reason: PartialReason | RefusalReason;
  children?: React.ReactNode;
}) {
  const { title, detail } = copyFor(reason);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="flex items-start gap-2.5 border-b border-gray-100 bg-gray-50 px-4 py-3.5">
        <span className="mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <svg
            className="size-3 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
        <div>
          <p className="mb-0.5 text-sm font-bold text-gray-900">{title}</p>
          <p className="text-[12.5px] leading-relaxed text-gray-500">{detail}</p>
        </div>
      </div>
      {children ? <div className="p-4">{children}</div> : null}
    </div>
  );
}
