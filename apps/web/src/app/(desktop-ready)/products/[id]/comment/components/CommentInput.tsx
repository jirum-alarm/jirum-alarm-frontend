'use client';

import { useAtom, useAtomValue } from 'jotai';

import Button from '@/components/common/Button';
import { Close } from '@/components/common/icons';
import { PAGE } from '@/constants/page';
import useMyRouter from '@/hooks/useMyRouter';

import { editingCommentAtom } from '../hooks/useComment';
import { useCommentInput } from '../hooks/useCommentInput';

import { CANCEL_EVENT, TComment, TEditStatus } from './CommentLayout';

interface BottomInputProps {
  productId: number;
  isUserLogin: boolean;
}

export default function CommentInput({ productId, isUserLogin }: BottomInputProps) {
  const router = useMyRouter();
  const editingComment = useAtomValue(editingCommentAtom);

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
      className="pc:min-h-[80px] flex min-h-[64px] w-full items-end gap-x-3 border-t border-gray-300 bg-white px-5 py-3"
      onPointerDown={handlePointerDown}
    >
      <div className="flex grow flex-col items-center overflow-hidden rounded-lg border border-transparent bg-gray-50 focus-within:border-gray-500">
        {editingComment?.status === 'reply' && (
          <div className="border-secondary-100 bg-secondary-50 text-secondary-700 flex h-[30px] w-full items-center justify-between border-b pr-2 pl-3 text-sm">
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
          <div className="border-primary-100 bg-primary-50 text-primary-700 flex h-[30px] w-full items-center justify-between border-b pr-2 pl-3 text-sm">
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
          className="pc:max-h-[300px] max-h-[100px] min-h-[40px] w-full resize-none border-none bg-transparent px-3 py-2 outline-hidden"
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
        className="text-primary-500 h-10 w-auto shrink-0 bg-gray-800 px-6 text-base font-semibold disabled:bg-gray-400 disabled:text-white"
        disabled={!canSubmit}
      >
        등록
      </Button>
    </form>
  );
}
