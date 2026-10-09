'use client';

import Button from '@/shared/ui/common/Button';
import { Cancel } from '@/shared/ui/common/icons';
import Input from '@/shared/ui/common/Input';

import { useKeywordInput } from '../../model/useKeywordInput';

const KeywordInput = ({ autoFocus = true }: { autoFocus?: boolean }) => {
  const { keyword, handleInputChange, reset, handleSubmit, canSubmit } = useKeywordInput();

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
              <button type="reset" onClick={reset}>
                <Cancel />
              </button>
            )
          }
        />
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
