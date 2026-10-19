/**
 * 화장품 상세 → 뷰티 버티컬 실험 `beauty_detail_room_v1`(2026-10-14) — web·앱 공용 배정 규칙.
 *
 * 질문: 화장품 상세(네이버 검색 유입의 착지점, 주 ~6,800회)에서 카톡 권유가 «핫딜방» 대신 «뷰티방»을 권하고
 * 「지름알림 뷰티에서 더 보기」 링크를 달면, 카톡방 입장·뷰티 버티컬 이동이 늘어나나.
 *
 * - 대상: categoryId 3(화장품) 상세만. 다른 카테고리는 배정 없음(이벤트에 exp 도 안 싣는다).
 * - 군: 기기 단위. 버킷 = experimentBucket(기기id, BEAUTY_ROOM_EXPERIMENT_ID)(서버와 같은 값). 버킷 < PERCENT 면 b(뷰티방).
 * - a(대조) = 핫딜방 권유. b = 같은 자리(soft·구매 후·첫 방문 시트)가 뷰티방을 권하고 링크를 단다.
 * - 계측: okachat_prompt_view/click·okachat_handoff 에 exp=`beauty_detail_room_v1:<a|b>` 와 room.
 *
 * 기기 id 읽기·링크 env 는 플랫폼마다 달라 각 앱에 둔다.
 * ★진행 중에 실험 id 를 바꾸면 군이 섞인다. 끄려면 PERCENT 를 0 으로(웹 태그·앱 OTA) — 전원 대조, exp 도 안 실린다.
 */
export const BEAUTY_ROOM_EXPERIMENT_ID = 'beauty_detail_room_v1';
// 2026-10-14 전면 적용(100): 4주 군별 권유 클릭 ~26회(GA4 9/30~10/13 기준선 × 화장품 7.8%)라 검출 가능 최소 2.2배 —
// 판정이 안 나는 실험이라 접고 화장품 상세 전원에게 뷰티방을 권한다. 효과는 관찰 obs_beauty_kakao_room 으로 본다.
export const BEAUTY_ROOM_PERCENT = 100;
/** web shared/config/categories 의 '화장품'. /beauty 랜딩과 같은 카테고리. */
export const BEAUTY_CATEGORY_ID = 3;

export type BeautyRoomArm = 'a' | 'b';

/**
 * 버킷(0~99) → 군. 실험 대상이 아니면 null — 화장품이 아니거나, 기기 id 가 없어 버킷이 없거나(null), 실험이 꺼졌다.
 */
export function beautyRoomArmForBucket(
  bucket: number | null,
  categoryId: number | null | undefined,
  percent: number = BEAUTY_ROOM_PERCENT,
): BeautyRoomArm | null {
  if (categoryId !== BEAUTY_CATEGORY_ID || bucket === null || percent <= 0) return null;
  return bucket < percent ? 'b' : 'a';
}

/** GA4 이벤트의 exp 파라미터 값. */
export const beautyRoomExpTag = (arm: BeautyRoomArm) => `${BEAUTY_ROOM_EXPERIMENT_ID}:${arm}`;
