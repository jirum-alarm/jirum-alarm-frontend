import {QueryMe} from '@/graphql/user';
import {HttpClient} from '@/shared/lib/client';

export class UserService {
  // Mixpanel identify 용 userId 조회. 실패해도 분석만 비활성될 뿐 흐름을 막지 않는다.
  static async fetchMyId(): Promise<string | null> {
    try {
      const res = await HttpClient.withAccessToken().execute(QueryMe);
      return res.data?.me?.id ?? null;
    } catch {
      return null;
    }
  }
}
