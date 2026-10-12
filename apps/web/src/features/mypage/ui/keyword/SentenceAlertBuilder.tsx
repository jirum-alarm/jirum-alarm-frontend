'use client';

import { button, chip, infoBox } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import { useSentenceAlert } from '../../model/useSentenceAlert';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

function priceText(min: number | null, max: number | null) {
  if (min != null && max != null) return `${won(min)} ~ ${won(max)}`;
  if (max != null) return `${won(max)} 이하`;
  if (min != null) return `${won(min)} 이상`;
  return null;
}

/**
 * 「문장으로 만들기」 — "에어팟 프로 20만원 밑으로, 케이스 말고" 를 키워드·가격 범위·제외 단어로 바꿔 등록한다.
 * 등록 전에 지난 30일이면 몇 건 왔을지를 보여 준다 — 키워드가 길면 영영 안 오는 걸 등록 전에 드러내려고.
 */
const SentenceAlertBuilder = () => {
  const {
    text,
    setText,
    maxLength,
    canParse,
    parse,
    isParsing,
    intent,
    keyword,
    setKeyword,
    register,
    isRegistering,
  } = useSentenceAlert();

  const selected = intent?.candidates.find((c) => c.keyword === keyword);
  const price = intent ? priceText(intent.minPrice, intent.maxPrice) : null;

  return (
    <section className={cn(infoBox, 'flex flex-col gap-3 p-4')}>
      <div>
        <h2 className="text-sm font-semibold text-gray-900">문장으로 만들기</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          원하는 걸 그대로 적으면 키워드·가격·뺄 단어로 바꿔 드려요.
        </p>
      </div>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          parse();
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={maxLength}
          rows={2}
          placeholder="예: 에어팟 프로 20만원 밑으로 뜨면, 케이스 말고"
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canParse}
          className={cn(
            button.size.md.box,
            'self-end text-sm',
            canParse
              ? cn(button.tone.dark.box, button.tone.dark.text)
              : cn(button.tone.primary.disabledBox, button.tone.primary.disabledText),
          )}
        >
          {isParsing ? '읽는 중…' : '조건 만들기'}
        </button>
      </form>

      {intent === null && (
        <p className="text-sm text-gray-700">
          문장에서 상품을 못 찾았어요. 위 칸에 상품 이름을 직접 적어 주세요.
        </p>
      )}

      {intent && (
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">키워드</span>
            <div className="flex flex-wrap gap-2">
              {intent.candidates.map((c) => {
                const on = c.keyword === keyword;
                return (
                  <button
                    key={c.keyword}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setKeyword(c.keyword)}
                    className={cn(
                      chip.size.sm.box,
                      chip.size.sm.text,
                      on
                        ? cn(chip.selected.box, chip.selected.text)
                        : cn(chip.idle.box, chip.idle.text),
                    )}
                  >
                    {c.keyword} · {c.recentMatchCount}건
                  </button>
                );
              })}
            </div>
          </div>

          {(price || intent.excludeKeywords.length > 0) && (
            <ul className="flex flex-col gap-1 text-sm text-gray-900">
              {price && <li>가격 {price}</li>}
              {intent.excludeKeywords.length > 0 && (
                <li>{intent.excludeKeywords.map((w) => `‘${w}’`).join(', ')} 들어간 딜은 빼요</li>
              )}
            </ul>
          )}

          <div className="text-sm text-gray-700">
            {selected && selected.recentMatchCount > 0 ? (
              <p>
                지난 30일이면{' '}
                <strong className="text-gray-900">{selected.recentMatchCount}건</strong>을 받았을
                거예요.
              </p>
            ) : (
              <p>
                지난 30일엔 이 조건의 딜이 없었어요. 올라오면 바로 알려드려요 — 자주 받고 싶으면 더
                짧은 키워드를 골라 보세요.
              </p>
            )}
            {keyword === intent.keyword && intent.recentSamples.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {intent.recentSamples.map((s) => (
                  <li key={s.id} className="truncate text-xs text-gray-500">
                    · {s.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={register}
            disabled={isRegistering || !keyword}
            className={cn(
              button.size.lg.box,
              'text-sm',
              isRegistering
                ? cn(button.tone.primary.disabledBox, button.tone.primary.disabledText)
                : cn(button.tone.primary.box, button.tone.primary.text),
            )}
          >
            {`‘${keyword}’ 알림 받기`}
          </button>
        </div>
      )}
    </section>
  );
};

export default SentenceAlertBuilder;
