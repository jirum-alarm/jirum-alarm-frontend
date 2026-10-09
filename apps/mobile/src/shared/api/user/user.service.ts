import {QueryMe} from '@/graphql/user';
import {HttpClient} from '@/shared/lib/client';

export class UserService {
  // GA4 identify(setUserId) 용 userId 조회. 실패해도 분석만 비활성될 뿐 흐름을 막지 않는다.
  static async fetchMyId(): Promise<string | null> {
    try {
      const res = await HttpClient.withAccessToken().execute(QueryMe);
      // 게스트는 회원이 아니다 — 댓글 소유·GA4 user_id·회원 판정이 모두 이 null 을 본다.
      if (res.data?.me?.isGuest) return null;
      return res.data?.me?.id ?? null;
    } catch {
      return null;
    }
  }
}
