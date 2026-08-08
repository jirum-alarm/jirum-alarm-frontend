import AnswerText from './AnswerText';
import CommunityReview from './CommunityReview';
import DealList from './DealList';
import Distribution from './Distribution';
import ExampleChips from './ExampleChips';
import FollowUp from './FollowUp';
import PartialAnswer from './PartialAnswer';
import PricePosition from './PricePosition';
import PriceTrend from './PriceTrend';

import type { AnswerBlock } from '../model/answer';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

function Avatar() {
  return (
    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-900">
      <svg
        className="size-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
      </svg>
    </span>
  );
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-gray-800">
    {children}
  </p>
);

/**
 * 블록 하나를 렌더한다. 도착한 블록만 그려지므로
 * 서버가 계산하는 순서대로 화면이 채워진다.
 */
function Block({ block }: { block: AnswerBlock }) {
  switch (block.kind) {
    case 'verdict':
      return (
        <Card>
          최근 딜 <b className="tabular-nums">{block.dealCount}건</b>을 봤어요.
          {block.lowest != null && (
            <>
              {' '}
              지금은 <b className="text-error-600 tabular-nums">{won(block.lowest)}</b>부터 있어요.
            </>
          )}
        </Card>
      );

    case 'partial':
      return (
        <PartialAnswer reason={block.reason}>
          {/*
           * NO_RESULTS 는 막다른 길이다 — 카피가 "아래 예시를 눌러보세요" 라고 약속하므로
           * 실제로 예시를 놓는다. 다른 사유는 아래에 걸러낸 딜이 이어지므로 불필요.
           */}
          {block.reason.code === 'NO_RESULTS' ? (
            <ExampleChips />
          ) : block.filteredCount > 0 ? (
            <p className="text-[12px] text-gray-600">
              걸러낸 딜 {block.filteredCount}개는 아래에 있어요.
            </p>
          ) : null}
        </PartialAnswer>
      );

    case 'distribution':
      return <Distribution prices={block.prices} />;

    case 'position':
      return <PricePosition position={block.position} title={block.title} />;

    case 'trend':
      return (
        <PriceTrend points={block.points} current={block.current} confidence={block.confidence} />
      );

    case 'text':
      return <AnswerText markdown={block.markdown} />;

    case 'followUp':
      return <FollowUp suggestions={block.suggestions} />;

    case 'review':
      return (
        <div>
          <p className="mb-2 text-[13px] font-bold text-gray-900">사람들은 뭐라고 했나</p>
          <CommunityReview summary={block.summary} title={block.title} />
        </div>
      );

    case 'deals': {
      /*
       * ★"이 가격대 딜" 이라고 해놓고 원화가 아닌 딜을 섞으면 헤더가 거짓이 된다.
       * 실측(무선이어폰, 데스크톱): 보이는 4건 중 2건이 USD 인데 가격대는
       * 4,159~99,000원 기준이었다. 생수는 "가격 미확인" 이 같은 자리에 섞였다.
       * 가격대 계산에서 이미 제외한 것들이므로, 목록에서도 분리하되 버리지는 않는다.
       */
      const comparable = block.deals.filter(
        (d) => d.parsedPrice != null && d.parsedPrice > 0 && (d.priceCurrency ?? 'KRW') === 'KRW',
      );
      const aside = block.deals.filter((d) => !comparable.includes(d));

      return (
        <div className="flex flex-col gap-4">
          {comparable.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-medium text-gray-500">
                이 가격대 딜 {comparable.length}개
              </p>
              <DealList deals={comparable} lowest={block.lowest} />
            </div>
          )}
          {aside.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-medium text-gray-500">
                가격 비교에서 뺀 딜 {aside.length}개{' '}
                <span className="font-normal text-gray-500">
                  · 해외 통화이거나 가격을 못 읽었어요
                </span>
              </p>
              <DealList deals={aside} lowest={null} />
            </div>
          )}
        </div>
      );
    }

    case 'failure':
      return (
        <p className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-[13.5px] text-gray-600">
          {block.message}
        </p>
      );

    /*
     * 배포가 겹치는 몇 초 동안 구 클라가 신 서버의 새 블록을 받을 수 있다. 그때 조용히 버린다.
     * never 로 받는 이유: 블록을 추가하고 case 를 빼먹으면 여기서 컴파일이 깨져야 한다
     * (default 를 그냥 두면 유니온이 늘어나도 타입 검사가 통과해버린다).
     */
    default:
      block satisfies never;
      return null;
  }
}

/** 서버가 준 id 를 들고 있는 블록. id 가 React key 이자 `patch` 대상이다. */
export type KeyedBlock = { id: string; block: AnswerBlock };

/**
 * ★키를 index 에서 **서버 id** 로 바꿨다.
 *
 * 왜: `patch` 로 토큰이 붙으면 블록은 더 이상 append-only 가 아니다 —
 * "이미 있는 블록의 내용이 바뀐다". index 키를 쓰면 내용이 바뀐 블록과 새로 온 블록을
 * React 가 구분할 근거가 없다. id 를 쓰면 patch 는 리렌더, 새 블록은 마운트가 된다.
 *
 * 복원된 대화(저장된 턴)는 서버 id 가 없으므로 호출부가 `t{turn}-{i}` 를 만들어 넣는다.
 */
export default function AnswerBubble({ blocks }: { blocks: KeyedBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex gap-2.5">
      <Avatar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {blocks.map(({ id, block }) => (
          <div key={id} className="rise">
            <Block block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}
