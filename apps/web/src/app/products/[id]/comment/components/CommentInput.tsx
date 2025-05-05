'use client';

import Button from '@/components/common/Button';
import { Close } from '@/components/common/icons';
import { PAGE } from '@/constants/page';
import useMyRouter from '@/hooks/useMyRouter';

import { useCommentInput } from '../hooks/useCommentInput';

import { CANCEL_EVENT, TComment, TEditStatus } from './CommentLayout';

interface BottomInputProps {
  productId: number;
  editingComment: {
    comment: TComment;
    status: TEditStatus;
  } | null;
  isUserLogin: boolean;
}

export default function CommentInput({ productId, editingComment, isUserLogin }: BottomInputProps) {
  const router = useMyRouter();

  const { handleInputChange, comment, handleSubmit, canSubmit, ref } = useCommentInput({
    productId,
    editingComment,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLFormElement>) => {
    if (!isUserLogin) {
      e.preventDefault();
      router.push(PAGE.LOGIN);
    }
  };

  const handleClickCancel = () => {
    document.dispatchEvent(new CustomEvent(CANCEL_EVENT));
  };

  const placeholder = isUserLogin ? '댓글을 입력해주세요.' : '로그인 해주세요.';

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 z-40 ml-[-1px] flex min-h-[64px] w-full max-w-screen-layout-max items-end gap-x-3 border-t border-gray-300 bg-white px-5 py-3"
      onPointerDown={handlePointerDown}
    >
      <div className="flex grow flex-col items-center overflow-hidden rounded-lg border border-transparent bg-gray-50 focus-within:border-gray-500">
        {editingComment?.status === 'reply' && (
          <div className="flex h-[30px] w-full items-center justify-between border-b border-secondary-100 bg-secondary-50 pl-3 pr-2 text-sm text-secondary-700">
            <div className="flex items-center gap-x-1">
              {editingComment.comment.author?.nickname ?? '?'}님에게 대댓글 남기는 중
            </div>
            <button
              className="-m-2 flex h-auto items-center gap-x-1 bg-transparent p-2"
              onClick={handleClickCancel}
            >
              <Close className="h-4 w-4" />
            </button>
          </div>
        )}
        {editingComment?.status === 'update' && (
          <div className="flex h-[30px] w-full items-center justify-between border-b border-primary-100 bg-primary-50 pl-3 pr-2 text-sm text-primary-700">
            <div className="flex items-center gap-x-1">댓글 수정 중</div>
            <button
              className="-m-2 flex h-auto items-center gap-x-1 bg-transparent p-2"
              onClick={handleClickCancel}
            >
              <Close className="h-4 w-4" />
            </button>
          </div>
        )}
        <textarea
          ref={ref}
          className="max-h-[100px] min-h-[40px] w-full resize-none border-none bg-transparent px-3 py-2 outline-none"
          placeholder={placeholder}
          value={comment}
          onChange={handleInputChange}
          disabled={!isUserLogin}
          style={{
            height: '40px',
          }}
          onInput={(e) => {
            e.currentTarget.style.height = '40px';
            const { scrollHeight } = e.currentTarget;
            e.currentTarget.style.height = `${Math.min(scrollHeight, 100)}px`;
          }}
          maxLength={300}
          rows={1}
        />
      </div>
      <Button
        type="submit"
        className="h-10 w-auto bg-gray-800 px-6 text-base font-semibold text-primary-500 disabled:bg-gray-400 disabled:text-white"
        disabled={!canSubmit}
      >
        등록
      </Button>
    </form>
  );
}
