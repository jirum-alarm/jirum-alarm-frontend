/**
 * 좋아요 낙관적 업데이트의 순수 계산부.
 *
 * ★왜 떼어냈나: 이 계산이 뮤테이션 콜백 안에 있으면 "눌렀을 때 숫자가 맞게
 * 오르내리나 · 실패하면 원래대로 돌아오나"를 런타임으로 확인할 방법이 없다
 * (소스텍스트 검사는 함수 이름만 본다). 여기 있으면 테스트가 실제로 실행한다.
 */

export type LikeableCounts = {
  isMyLike?: boolean | null;
  likeCount: number;
};

/**
 * 글 좋아요. web `CommunityPostDetail` 의 onMutate 와 같은 규칙 —
 * `isLike === true` 면 추천, `undefined` 면 추천 취소다(서버 인자 규약이 그렇다).
 */
export function applyPostLike<T extends LikeableCounts>(
  post: T,
  isLike?: boolean,
): T {
  const liked = isLike === true;
  return {
    ...post,
    isMyLike: liked,
    likeCount: post.likeCount + (liked ? 1 : -1),
  };
}

/**
 * 댓글 좋아요 토글. web `CommunityCommentSection` 의 onMutate 와 같은 규칙:
 * 지금 눌린 상태(`isMyLike`)를 뒤집는다.
 *
 * ⚠️ id 비교는 문자열로 한다 — 서버 id 는 ID(문자열)인데 뮤테이션 인자는
 * Int 라서 호출부에서 Number 로 바뀐다. `===` 로 그냥 비교하면 아무 댓글도
 * 안 맞아 화면이 조용히 안 바뀐다.
 */
export function applyCommentLike<
  T extends LikeableCounts & {id: string | number},
>(comments: T[], id: string | number, isMyLike: boolean): T[] {
  return comments.map(comment =>
    String(comment.id) === String(id)
      ? {
          ...comment,
          isMyLike: !isMyLike,
          likeCount: comment.likeCount + (isMyLike ? -1 : 1),
        }
      : comment,
  );
}

/** 삭제 낙관적 반영. 페이지 안에서 그 댓글만 뺀다. */
export function removeCommentById<T extends {id: string | number}>(
  comments: T[],
  id: string | number,
): T[] {
  return comments.filter(comment => String(comment.id) !== String(id));
}

/**
 * 목록 카드의 댓글 수만 고친다(작성 +1·삭제 -1). 이 숫자는 목록 쿼리만 들고 있다(글 상세엔 없다).
 * 예전엔 이걸 맞추려고 커뮤니티 쿼리 **전부**(떠 있는 세 탭 목록의 모든 페이지·핫딜 칸까지)를
 * 무효화했다 — 댓글 하나에 목록 전체를 다시 받을 이유가 없다.
 */
export function bumpReplyCount<
  T extends {id: string | number; replyCount: number},
>(posts: T[], postId: string | number, delta: number): T[] {
  return posts.map(post =>
    String(post.id) === String(postId)
      ? {...post, replyCount: Math.max(0, post.replyCount + delta)}
      : post,
  );
}
