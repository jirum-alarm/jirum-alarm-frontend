/**
 * 화장품 상세 → 뷰티 버티컬 실험 `beauty_detail_room_v1`(2026-10-14).
 * 배정 규칙(id·비율·카테고리·버킷→군)은 @jirum/domain beauty-room-experiment — 앱과 같은 원본.
 * 기기 id → 버킷은 useBeautyRoomAssignment 가 계산해 넘긴다. 뷰티방 링크 env(NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL)가 비어도 꺼진다.
 */
export {
  BEAUTY_CATEGORY_ID,
  BEAUTY_ROOM_EXPERIMENT_ID,
  BEAUTY_ROOM_PERCENT,
  type BeautyRoomArm,
  beautyRoomArmForBucket,
  beautyRoomExpTag,
} from '@jirum/domain/beauty-room-experiment';
