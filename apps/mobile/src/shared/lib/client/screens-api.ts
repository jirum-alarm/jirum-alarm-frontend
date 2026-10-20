import AsyncStorage from '@react-native-async-storage/async-storage';
import {GRAPHQL_ENDPOINT} from '@/shared/constant/endpoint.ts';

/**
 * 화면 하네스(scripts/screens-ios.sh SCREENS_API=fixture)가 앱을 고정 데이터 서버에 붙이는 입구.
 * 하네스가 앱 저장소에 이 키로 주소를 넣고 콜드 스타트하면 모든 GraphQL 요청이 그리로 간다 —
 * 운영 데이터는 실행마다 달라 같은 화면을 다시 만들 수 없고, 점검·장애 중엔 첫 실행 게스트 생성부터 막혔다(10/20).
 * 같은 맥의 서버만 받는다(localhost·127.0.0.1) — 다른 주소면 무시해 사용자 요청이 엉뚱한 곳으로 가지 않게.
 * 앱 저장소는 앱 샌드박스라 앱 밖에서 이 키를 쓸 수 있는 건 시뮬레이터를 다루는 하네스뿐이다.
 */
export const SCREENS_API_KEY = 'jirum:screens-api-url';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/** 받아들일 주소면 그대로, 아니면 null. */
export function parseScreensApiUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const m = /^(https?):\/\/([^/:?#]+)(:\d+)?(\/[^?#]*)?$/.exec(value.trim());
  if (!m || !LOCAL_HOSTS.has(m[2])) return null;
  return value.trim();
}

let endpoint: Promise<string> | null = null;

/** GraphQL 주소 — 하네스 키가 있으면 그 주소, 없으면 운영. 저장소는 앱이 뜬 뒤 한 번만 읽는다. */
export function graphqlEndpoint(): Promise<string> {
  endpoint ??= AsyncStorage.getItem(SCREENS_API_KEY)
    .then(v => parseScreensApiUrl(v) ?? GRAPHQL_ENDPOINT)
    .catch(() => GRAPHQL_ENDPOINT);
  return endpoint;
}

/** 테스트용 — 읽어 둔 값을 비운다. */
export function resetScreensApiForTest() {
  endpoint = null;
}
