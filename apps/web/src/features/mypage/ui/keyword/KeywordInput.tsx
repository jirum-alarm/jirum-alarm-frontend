'use client';

import { addChip } from '@jirum/design-system/recipes';
import { broadenSuggestion, describeKeywordFrequency } from '@jirum/domain/keyword-frequency';
import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import Button from '@/shared/ui/common/Button';
import { Cancel } from '@/shared/ui/common/icons';
import Input from '@/shared/ui/common/Input';

import { useUpdateKeyword } from '@/entities/auth/model/update-keyword';

import { useKeywordFrequencies } from '../../model/useKeywordFrequencies';
import { useKeywordInput } from '../../model/useKeywordInput';

/** 입력이 멈춘 뒤에만 미리보기를 묻는다 — 글자마다 서버를 부르지 않게. */
const PREVIEW_DELAY_MS = 400;

function useSettledValue(value: string, delayMs: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}

const KeywordInput = ({ autoFocus = true }: { autoFocus?: boolean }) => {
  const { keyword, handleInputChange, reset, handleSubmit, canSubmit } = useKeywordInput();
  // 등록 전 미리보기 — «이 키워드로 알림이 얼마나 오나». 드물면 첫 낱말(대개 브랜드)로 대신 등록하게 한다.
  const typed = keyword.value.trim();
  const settled = useSettledValue(typed, PREVIEW_DELAY_MS);
  const previewing = !!typed && !keyword.error && settled === typed;
  const frequencyOf = useKeywordFrequencies(previewing ? [typed] : [], previewing);
  const frequency = previewing ? frequencyOf(typed) : null;
  const described = frequency ? describeKeywordFrequency(frequency) : null;
  const suggestion = frequency ? broadenSuggestion(frequency) : null;
  const promptPushChannel = usePushChannelPrompt();
  const { mutate: registerSuggestion, isPending: registeringSuggestion } = useUpdateKeyword({
    source: 'mypage_broaden',
    onSuccess: ({ keyword: registered }) => {
      reset();
      promptPushChannel(registered);
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.nativeEvent.isComposing) {
      e.preventDefault();
    }
  };

  return (
    // PC: 입력칸 옆에 버튼 — 예전엔 폭 700px 짜리 회색 비활성 막대가 입력칸 밑에 깔려 있었다.
    // 폰: 하단 고정. 이 화면엔 바텀내비가 없어 --bottom-nav-padding 이 0 이라, 홈 인디케이터는 --bottom-chrome-padding 이 맡는다.
    <form onSubmit={handleSubmit} className="pc:flex pc:items-start pc:gap-2">
      <div className="pc:flex-1">
        <Input
          autoFocus={autoFocus}
          type="text"
          placeholder="알림 받을 상품 이름 (예: 에어팟, 삼다수)"
          error={keyword.error}
          helperText={'키워드는 2자 이상 20자까지 입력할 수 있어요.'}
          value={keyword.value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          icon={
            !!keyword.value && (
              <button type="reset" onClick={reset} aria-label="키워드 지우기">
                <Cancel />
              </button>
            )
          }
        />
        {described && (
          <div className="mt-2 flex flex-col items-start gap-2" aria-live="polite">
            <p className={cn('text-xs', described.sparse ? 'text-warning-700' : 'text-gray-500')}>
              {described.text}
            </p>
            {suggestion && (
              <>
                <p className="text-xs text-gray-500">{suggestion.text}</p>
                <button
                  type="button"
                  disabled={registeringSuggestion}
                  onClick={() => registerSuggestion({ keyword: suggestion.keyword })}
                  className={cn(
                    'flex items-center gap-1.5 disabled:opacity-50',
                    addChip.box,
                    addChip.text,
                  )}
                >
                  {suggestion.registerButton}
                  <span className={addChip.plus}>+</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="pc:static pc:m-0 pc:max-w-none pc:w-28 pc:shrink-0 pc:p-0 fixed right-0 bottom-[var(--bottom-nav-padding)] left-0 m-auto max-w-[600px] bg-white px-5 pt-6 pb-[max(1.5rem,var(--bottom-chrome-padding))]">
        <Button type="submit" className="pc:h-11 w-full" disabled={!canSubmit}>
          등록
        </Button>
      </div>
    </form>
  );
};

export default KeywordInput;
