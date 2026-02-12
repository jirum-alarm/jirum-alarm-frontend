import { BubbleChatFill } from '@/shared/ui/common/icons';

const CommentListSkeleton = () => {
  return (
    <>
      <div className="pc:pb-10 flex h-full w-full items-center justify-center pt-6">
        <div className="flex flex-col items-center gap-y-3">
          <BubbleChatFill />
          <div className="flex flex-col items-center gap-y-1">
            <p className="font-semibold text-gray-700">첫 후기를 남겨주세요!</p>
            <p className="text-sm font-medium text-gray-500">댓글로 함께 소통해요</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentListSkeleton;
