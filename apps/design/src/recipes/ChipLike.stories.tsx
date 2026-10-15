import { addChip, keywordChip, linkChip, wordTag } from '@jirum/design-system/recipes';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

/** 칩 모양이지만 고르는 칩(Chip)이 아닌 것들 — 링크·최근 검색어·추천 키워드·단어 태그. */
const Gallery = () => (
  <div className="flex flex-col gap-6">
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        링크 칩 — 다른 페이지로 가는 칩 모양 링크(web 만)
      </h3>
      <div className="flex flex-wrap gap-2">
        {['아이폰 17', '갤럭시 S26', '에어팟 프로'].map((word) => (
          <a key={word} href={`#${word}`} className={`inline-block ${linkChip}`}>
            {word}
          </a>
        ))}
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        최근 검색어 칩 — 눌러서 다시 검색 + ✕ 로 지우기
      </h3>
      <div className="flex flex-wrap gap-2">
        {['생수', '닌텐도 스위치'].map((word) => (
          <span key={word} className={`inline-flex items-center gap-1 ${keywordChip.box}`}>
            <button type="button" className={keywordChip.text}>
              {word}
            </button>
            <button type="button" aria-label={`${word} 지우기`} className="text-sm text-gray-500">
              ✕
            </button>
          </span>
        ))}
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">
        추천 키워드 칩 — 눌러서 키워드 알림 바로 등록
      </h3>
      <div className="flex flex-wrap gap-2">
        {['커피', '라면'].map((word) => (
          <button
            key={word}
            type="button"
            className={`inline-flex items-center gap-1 ${addChip.box}`}
          >
            <span className={addChip.text}>{word}</span>
            <span aria-hidden className={addChip.plus}>
              +
            </span>
          </button>
        ))}
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900">단어 태그 — 누를 수 없는 단어 나열</h3>
      <div className="flex flex-wrap gap-2">
        <span
          className={`${wordTag.box} ${wordTag.tone.fill.box} ${wordTag.text} ${wordTag.tone.fill.text}`}
        >
          맥북
        </span>
        <span
          className={`${wordTag.box} ${wordTag.tone.fill.box} ${wordTag.text} ${wordTag.tone.fill.text}`}
        >
          아이패드
        </span>
        <span
          className={`${wordTag.box} ${wordTag.tone.struck.box} ${wordTag.text} ${wordTag.tone.struck.text}`}
        >
          케이스
        </span>
        <span
          className={`${wordTag.box} ${wordTag.tone.more.box} ${wordTag.text} ${wordTag.tone.more.text}`}
        >
          +3개 더 보기
        </span>
      </div>
    </section>
  </div>
);

const meta = {
  title: '레시피/칩 모양 링크·태그',
  component: Gallery,
  parameters: {
    docs: {
      description: {
        component:
          '고르는 칩과 다른 물건들. 다른 페이지로 가면 링크 칩, 다시 검색은 최근 검색어 칩, 바로 등록은 추천 키워드 칩, 누를 수 없는 나열은 단어 태그.',
      },
    },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
