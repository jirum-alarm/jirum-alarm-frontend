import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

/**
 * 수기 TypedDocumentString — codegen 생성 타입이 아니다.
 *
 * codegen 은 스키마를 dev 엔드포인트(`jirum-dev-api.kyojs.com`)에서 당겨오는데
 * dev 환경이 구 클러스터 드레인과 함께 사라져 응답하지 않는다. 운영 스키마로 돌리면
 * 이번 변경과 무관한 기존 문서(`graphql/product.ts` 의 `categoryId` ↔ 운영은
 * `categoryIds`)에서 validation 이 깨져 전체 생성이 중단된다.
 * → notification.service.ts 와 같은 escape hatch 를 따른다. dev 복구 또는 위
 *   불일치 정리 후 codegen 으로 옮기면 된다.
 */
type PushSettingResult = { pushSetting: { id: string; priceDropOnly: boolean } };
type UpdatePushSettingResult = { updatePushSetting: boolean };
type UpdatePriceDropOnlyVariables = { priceDropOnly: boolean };

const QueryPushSettingDocument = new TypedDocumentString<PushSettingResult, Record<string, never>>(`
  query QueryPushSetting {
    pushSetting {
      id
      priceDropOnly
    }
  }
`);

const MutationUpdatePriceDropOnlyDocument = new TypedDocumentString<
  UpdatePushSettingResult,
  UpdatePriceDropOnlyVariables
>(`
  mutation MutationUpdatePriceDropOnly($priceDropOnly: Boolean) {
    updatePushSetting(priceDropOnly: $priceDropOnly)
  }
`);

export class SettingService {
  static async getPushSetting() {
    return execute(QueryPushSettingDocument).then((res) => res.data);
  }

  static async updatePriceDropOnly(priceDropOnly: boolean) {
    return execute(MutationUpdatePriceDropOnlyDocument, { priceDropOnly }).then((res) => res.data);
  }
}
