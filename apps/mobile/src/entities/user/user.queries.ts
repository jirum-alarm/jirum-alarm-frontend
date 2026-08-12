import {queryOptions} from '@tanstack/react-query';

import {UserService} from '@/shared/api/user/user.service';

export class UserQueries {
  static readonly keys = {
    all: ['user'] as const,
    me: () => [...this.keys.all, 'me'] as const,
  };

  /**
   * 로그인 유저 id. 댓글 소유 판정(수정/삭제 메뉴 노출)에 쓴다.
   * 비로그인이면 null 이라 그대로 "로그인 안 됨" 신호가 된다.
   */
  static me() {
    return queryOptions({
      queryKey: this.keys.me(),
      queryFn: UserService.fetchMyId,
      staleTime: 1000 * 60 * 5,
    });
  }
}
