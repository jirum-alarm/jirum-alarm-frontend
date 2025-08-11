'use client';

import Button from '@/components/common/Button';
import { Cancel } from '@/components/common/icons';
import Input from '@/components/common/Input';
import { useFcmPermission } from '@/lib/firebase/useFcmPermission';

import { useKeywordInput } from '../hooks/useKeywordInput';

const KeywordInput = () => {
  const { keyword, handleInputChange, reset, handleSubmit, canSubmit } = useKeywordInput();
  const { requestPermissionAndRegister } = useFcmPermission();

  return (
    <form onSubmit={handleSubmit}>
      <Input
        autoFocus
        type="text"
        placeholder="키워드를 입력해주세요."
        error={keyword.error}
        helperText={'키워드는 최대 20자까지만 입력할 수 있어요.'}
        value={keyword.value}
        onChange={handleInputChange}
        icon={
          !!keyword.value && (
            <button type="reset" onClick={reset}>
              <Cancel />
            </button>
          )
        }
      />
      <div className="fixed right-0 bottom-0 left-0 m-auto max-w-[600px] bg-white px-5 py-6">
        <Button
          type="submit"
          onClick={requestPermissionAndRegister}
          className="w-full"
          disabled={!canSubmit}
        >
          등록
        </Button>
      </div>
    </form>
  );
};

export default KeywordInput;
