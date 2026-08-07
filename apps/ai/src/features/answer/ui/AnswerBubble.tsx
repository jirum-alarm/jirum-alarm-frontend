import CommunityReview from './CommunityReview';
import DealList from './DealList';
import Distribution from './Distribution';
import PartialAnswer from './PartialAnswer';

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
          {block.filteredCount > 0 ? (
            <p className="text-[12px] text-gray-600">
              걸러낸 딜 {block.filteredCount}건은 아래에 있어요.
            </p>
          ) : null}
        </PartialAnswer>
      );

    case 'distribution':
      return <Distribution prices={block.prices} />;

    case 'review':
      return (
        <div>
          <p className="mb-2 text-[13px] font-bold text-gray-900">사람들은 뭐라고 했나</p>
          <CommunityReview summary={block.summary} title={block.title} />
        </div>
      );

    case 'deals':
      return (
        <div>
          <p className="mb-2 text-[12px] font-medium text-gray-500">
            이 가격대 딜 {block.deals.length}건
          </p>
          <DealList deals={block.deals} lowest={block.lowest} />
        </div>
      );

    case 'failure':
      return (
        <p className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-[13.5px] text-gray-600">
          {block.message}
        </p>
      );
  }
}

export default function AnswerBubble({ blocks }: { blocks: AnswerBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex gap-2.5">
      <Avatar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {blocks.map((b, i) => (
          // 블록은 append-only 라 index 키가 안정적이다
          <div key={`${b.kind}-${i}`} className="rise">
            <Block block={b} />
          </div>
        ))}
      </div>
    </div>
  );
}
