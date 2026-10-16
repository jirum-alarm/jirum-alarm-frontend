import {
  adLabel,
  button,
  cardThumb,
  dealRow,
  detailInfo,
  emptyText,
  infoBox,
  promptCard,
} from '@jirum/design-system/recipes';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const ROWS = [
  ['쇼핑몰', '쿠팡'],
  ['가격 조건', '와우 회원 · 카드 할인 적용 시 (최대 10% 즉시 할인, 한 번에 2개까지)'],
  ['배송비', '무료'],
] as const;

/** 면·상자 레시피 — 사진 틀·정보 상자·상세 정보 표·딜 줄·빈 목록 안내. 여백·배치는 자리마다. */
const Gallery = () => (
  <div className="flex max-w-sm flex-col gap-6">
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        카드 사진 틀 — 사진이 늦어도 자리가 보이게
      </h3>
      <div className="flex gap-2">
        <div className={`size-24 ${cardThumb}`} />
        <div className={`size-24 ${cardThumb}`} />
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">정보 상자 — 본문 안 옅은 면 + 테두리</h3>
      <div className={`p-4 ${infoBox}`}>
        <p className="text-sm text-gray-800">지난 1년 핫딜 보통가보다 18% 싸요.</p>
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        상세 정보 표 — 라벨 고정폭 왼쪽, 값은 옆에서 줄바꿈
      </h3>
      <dl className={`flex flex-col ${detailInfo.list}`}>
        {ROWS.map(([label, value]) => (
          <div key={label} className={`flex ${detailInfo.row}`}>
            <dt className={detailInfo.label}>{label}</dt>
            <dd className={detailInfo.value}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        딜 줄 — 같은 상품 다른 가격 목록 한 줄(web 만)
      </h3>
      <a href="#deal" className={`flex items-center gap-3 ${dealRow}`}>
        <div className={`size-12 ${cardThumb}`} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm text-gray-900">삼다수 2L 24병</span>
          <span className="text-sm font-semibold text-gray-900">12,900원</span>
        </div>
      </a>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">빈 목록 한 줄 안내</h3>
      <p className={`py-6 text-center ${emptyText}`}>아직 등록한 키워드가 없어요.</p>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">배너 위 AD 표시</h3>
      <div className="bg-secondary-100 relative h-24 w-64 rounded-lg">
        <span className={`absolute right-2 bottom-2 ${adLabel.box} ${adLabel.text}`}>AD</span>
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        권유 카드 — 상세의 쿠팡 검색(neutral)·카톡방 입장(brand)
      </h3>
      {(['neutral', 'brand'] as const).map((tone) => (
        <div key={tone} className={`flex w-[360px] ${promptCard.box} ${promptCard.tone[tone].box}`}>
          <span className="min-w-0 flex-1">
            <span className={`block ${promptCard.title}`}>
              {tone === 'neutral' ? '다른 판매처 가격도 볼까요?' : '핫딜 오픈 채팅방 입장하기'}
            </span>
            <span className={`block truncate ${promptCard.description}`}>
              {tone === 'neutral'
                ? '쿠팡에서 ‘삼다수’ 검색 결과 보기'
                : '지름알림이 엄선한 핫딜만 골라 받아보세요!'}
            </span>
          </span>
          <span
            aria-hidden
            className={`${promptCard.action.box} ${promptCard.action.text} ${promptCard.tone[tone].action.box} ${promptCard.tone[tone].action.text}`}
          >
            {tone === 'neutral' ? '보기' : '입장'}
          </span>
        </div>
      ))}
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        작은 버튼(button.size.xs) — 줄 끝 동작(알림함 「완료」·「핫딜만 받기」)
      </h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`${button.size.xs.box} ${button.size.xs.text} ${button.tone.neutralOutline.box} ${button.tone.neutralOutline.text}`}
        >
          핫딜만 받기
        </button>
        <button
          type="button"
          className={`${button.size.xs.box} ${button.size.xs.text} ${button.tone.dark.box} ${button.tone.dark.text}`}
        >
          켜기
        </button>
      </div>
    </section>
  </div>
);

const meta = {
  title: '레시피/면·상자',
  component: Gallery,
  parameters: {
    docs: {
      description: {
        component:
          '컴포넌트 없이 자리마다 클래스를 직접 읽는 면·상자들. 사진 자리는 cardThumb, 본문 안 요약은 infoBox, 상세 줄은 detailInfo, 같은 상품 다른 가격은 dealRow, 빈 목록은 emptyText.',
      },
    },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
