'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { CommunityService } from '@/shared/api/community/community.service';
import { displayTime } from '@/shared/lib/utils/displayTime';
import {
  Action,
  AlertDialog,
  Cancel,
  Content as AlertContent,
  Description,
  Footer,
  Header,
  Title,
} from '@/shared/ui/common/AlertDialog/AlertDialog';
import BottomSheet from '@/shared/ui/common/BottomSheet';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';
import { CommunityQueries } from '@/entities/community';

function CommentItem({
  comment,
  isMyComment,
  isUserLogin,
  onEdit,
  onDelete,
  onLike,
}: {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    likeCount: number;
    isMyLike?: boolean | null;
    author?: { id: string; nickname: string } | null;
  };
  isMyComment: boolean;
  isUserLogin: boolean;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string, isMyLike: boolean) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col px-5 py-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-x-2">
          <span className="typography-body-14m text-fg-secondary-strong">
            {comment.author?.nickname ?? '알 수 없음'}
          </span>
          <span className="text-fg-tertiary text-xs">{displayTime(comment.createdAt)}</span>
        </div>
        {isMyComment && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-fg-tertiary flex h-6 w-6 items-center justify-center transition-transform active:scale-95"
            aria-label="댓글 메뉴"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-fg-primary typography-body-14r mt-1">{comment.content}</p>
      <div className="mt-2 flex items-center gap-x-3 text-xs">
        <button
          type="button"
          onClick={() => isUserLogin && onLike(comment.id, !!comment.isMyLike)}
          className={`flex items-center gap-x-1 transition-transform active:scale-95 ${comment.isMyLike ? 'text-primary-500' : 'text-fg-tertiary'} ${!isUserLogin ? 'opacity-40' : ''}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill={comment.isMyLike ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <path d="M2 9.5V13h2l5-3.5V6H7V2.5L2 9.5z" strokeLinejoin="round" />
            <rect x="9" y="6" width="2" height="7" rx="0.5" />
          </svg>
          좋아요 {comment.likeCount}
        </button>
      </div>

      <BottomSheet open={isMenuOpen} onOpenChange={setIsMenuOpen} title="댓글 메뉴">
        <div className="flex flex-col items-center pt-4 pb-8">
          <button
            className="text-fg-strong flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
            onClick={() => {
              setIsMenuOpen(false);
              onEdit(comment.id, comment.content);
            }}
          >
            댓글 수정하기
          </button>
          <div className="bg-surface-emphasis mx-5 h-px w-full" />
          <button
            className="text-fg-error flex h-14 w-full items-center justify-center text-lg font-medium transition-transform active:scale-[0.98]"
            onClick={() => {
              setIsMenuOpen(false);
              setIsDeleteConfirmOpen(true);
            }}
          >
            댓글 삭제하기
          </button>
        </div>
      </BottomSheet>

      {isDeleteConfirmOpen && (
        <AlertDialog
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open) setIsDeleteConfirmOpen(false);
          }}
        >
          <AlertContent>
            <Header>
              <Title className="typography-title-16sb text-fg-primary">댓글을 삭제할까요?</Title>
              <Description className="text-fg-secondary typography-body-14r">
                댓글을 삭제하면 다시 복구할 수 없어요.
              </Description>
            </Header>
            <Footer>
              <Cancel className="typography-body-14m bg-surface-muted text-fg-secondary-strong flex h-11 flex-1 items-center justify-center rounded-lg">
                취소
              </Cancel>
              <Action
                className="bg-error-500 typography-body-14m text-fg-inverse flex h-11 flex-1 items-center justify-center rounded-lg"
                onClick={() => onDelete(comment.id)}
              >
                삭제
              </Action>
            </Footer>
          </AlertContent>
        </AlertDialog>
      )}
    </div>
  );
}

function CommunityCommentList({
  postId,
  myUserId,
  isUserLogin,
}: {
  postId: number;
  myUserId?: string;
  isUserLogin: boolean;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const {
    data: { pages },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(CommunityQueries.comments(postId));

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const { mutate: updateComment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      CommunityService.updateComment({ id, content }),
    onSuccess: () => {
      setEditingId(null);
      setEditContent('');
      queryClient.invalidateQueries({ queryKey: CommunityQueries.comments(postId).queryKey });
    },
    onError: () => toast('수정에 실패했어요.'),
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: (id: number) => CommunityService.removeComment(id),
    onSuccess: () => {
      toast('댓글이 삭제되었어요.');
      queryClient.invalidateQueries({ queryKey: CommunityQueries.comments(postId).queryKey });
    },
    onError: () => toast('삭제에 실패했어요.'),
  });

  const { mutate: likeComment } = useMutation({
    mutationFn: ({ id, isMyLike }: { id: number; isMyLike: boolean }) =>
      CommunityService.likeComment(id, isMyLike ? undefined : true),
    onMutate: ({ id, isMyLike }) => {
      const key = CommunityQueries.comments(postId).queryKey;
      const prev = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            comments: page.comments.map((c: any) =>
              c.id === String(id)
                ? {
                    ...c,
                    isMyLike: !isMyLike,
                    likeCount: c.likeCount + (isMyLike ? -1 : 1),
                  }
                : c,
            ),
          })),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(CommunityQueries.comments(postId).queryKey, ctx.prev);
      toast('좋아요 처리에 실패했어요.');
    },
  });

  const comments = pages.flatMap((page) => page?.comments ?? []);

  if (comments.length === 0) {
    return (
      <div className="text-fg-tertiary typography-body-14r py-8 text-center">
        첫 번째 댓글을 남겨보세요
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {comments.map((comment) => {
        const isMyComment = !!myUserId && `${comment.author?.id}` === `${myUserId}`;

        if (editingId === comment.id) {
          return (
            <div key={comment.id} className="flex flex-col gap-y-2 px-5 py-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={300}
                rows={2}
                className="border-border-strong bg-surface-subtle typography-body-14r w-full resize-none rounded-lg border px-3 py-2 outline-none focus:border-gray-500"
              />
              <div className="flex justify-end gap-x-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="typography-body-14m bg-surface-muted text-fg-secondary-strong h-8 rounded-lg px-4 transition-transform active:scale-95"
                >
                  취소
                </button>
                <button
                  onClick={() =>
                    updateComment({ id: Number(comment.id), content: editContent.trim() })
                  }
                  disabled={!editContent.trim() || isUpdating}
                  className="typography-body-14sb text-fg-inverse bg-surface-inverse-strong disabled:bg-surface-disabled-strong h-8 rounded-lg px-4 transition-transform active:scale-95"
                >
                  수정
                </button>
              </div>
            </div>
          );
        }

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            isMyComment={isMyComment}
            isUserLogin={isUserLogin}
            onEdit={(id, content) => {
              setEditingId(id);
              setEditContent(content);
            }}
            onDelete={(id) => removeComment(Number(id))}
            onLike={(id, isMyLike) => likeComment({ id: Number(id), isMyLike })}
          />
        );
      })}
      <div ref={ref} className="h-1" />
      {isFetchingNextPage && (
        <div className="text-fg-tertiary typography-body-14r flex items-center justify-center py-4">
          불러오는 중...
        </div>
      )}
    </div>
  );
}

function CommunityCommentInput({ postId, isUserLogin }: { postId: number; isUserLogin: boolean }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: () => CommunityService.addComment({ parentId: postId, content }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({
        queryKey: CommunityQueries.comments(postId).queryKey,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (content.trim()) addComment();
      }}
      className="border-border-strong bg-surface-default sticky bottom-[var(--bottom-nav-padding,0px)] z-10 flex min-h-[64px] w-full items-end gap-x-3 border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="bg-surface-subtle flex grow overflow-hidden rounded-lg border border-transparent focus-within:border-gray-500">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isUserLogin ? '댓글을 입력해주세요.' : '로그인 후 댓글을 달 수 있어요.'}
          disabled={!isUserLogin}
          maxLength={300}
          rows={1}
          className="typography-body-14r max-h-[100px] min-h-[40px] w-full resize-none bg-transparent px-3 py-2 outline-none"
          style={{ height: '40px' }}
          onInput={(e) => {
            const t = e.currentTarget;
            requestAnimationFrame(() => {
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 100)}px`;
            });
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim() || isPending || !isUserLogin}
        className="typography-body-14sb text-fg-inverse bg-surface-inverse-strong disabled:bg-surface-disabled-strong h-10 shrink-0 rounded-lg px-5 transition-transform active:scale-95"
      >
        등록
      </button>
    </form>
  );
}

export default function CommunityCommentSection({
  postId,
  isUserLogin,
}: {
  postId: number;
  isUserLogin: boolean;
}) {
  const { data: authData } = useQuery(AuthQueries.me());
  const myUserId = authData?.me?.id ? `${authData.me.id}` : undefined;

  return (
    <section className="mt-4">
      <div className="px-5 pb-2">
        <h2 className="typography-title-16sb text-fg-primary">댓글</h2>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col divide-y divide-gray-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-y-1.5 px-5 py-3">
                <div className="flex items-center gap-x-2">
                  <div className="bg-surface-muted h-3.5 w-14 animate-pulse rounded" />
                  <div className="bg-surface-muted h-3 w-8 animate-pulse rounded" />
                </div>
                <div className="bg-surface-muted h-3.5 w-full animate-pulse rounded" />
                <div className="bg-surface-muted h-3.5 w-2/3 animate-pulse rounded" />
                <div className="bg-surface-muted h-3 w-12 animate-pulse rounded" />
              </div>
            ))}
          </div>
        }
      >
        <CommunityCommentList postId={postId} myUserId={myUserId} isUserLogin={isUserLogin} />
      </Suspense>
      <CommunityCommentInput postId={postId} isUserLogin={isUserLogin} />
    </section>
  );
}
