import { BubbleChatFill } from '@/components/common/icons';

const CommentListSkeleton = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex h-40 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-y-3">
            <BubbleChatFill />
            <div className="flex flex-col items-center gap-y-1">
              <p className="font-semibold text-gray-700">첫 후기를 남겨주세요!</p>
              <p className="text-sm font-medium text-gray-500">댓글로 함께 소통해요</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentListSkeleton;
