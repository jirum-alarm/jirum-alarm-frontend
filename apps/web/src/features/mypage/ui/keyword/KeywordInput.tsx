'use client';

import Button from '@/shared/ui/common/Button';
import { Cancel } from '@/shared/ui/common/icons';
import Input from '@/shared/ui/common/Input';

import { useKeywordInput } from '../../model/useKeywordInput';

const KeywordInput = () => {
  const { keyword, handleInputChange, reset, handleSubmit, canSubmit } = useKeywordInput();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.nativeEvent.isComposing) {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        autoFocus
        type="text"
        placeholder="키워드를 입력해주세요."
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
      <div className="fixed right-0 bottom-[var(--bottom-nav-padding)] left-0 m-auto max-w-[600px] bg-white px-5 py-6">
        <Button type="submit" className="w-full" disabled={!canSubmit}>
          등록
        </Button>
      </div>
    </form>
  );
};

export default KeywordInput;
