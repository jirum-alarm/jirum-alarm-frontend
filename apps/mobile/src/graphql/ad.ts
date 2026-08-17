import {graphql} from '../shared/api/gql';

/**
 * 자체 광고 슬롯. 애드센스와는 다른 시스템이다 —
 * 애드센스는 상세·검색에만 있고 홈엔 없다(2026-08-17 확인).
 * 홈 캐러셀 배너는 이 슬롯을 쓰고, 노출·클릭 집계를 우리가 직접 한다.
 *
 * ⚠️ 집계 뮤테이션이 빠지면 화면은 멀쩡한데 광고 매출 측정이 조용히 죽는다.
 *
 * web 정본: apps/web/src/graphql/ad.ts
 */

export const QueryActiveAds = graphql(`
  query ActiveAds($slotLocation: AdvertiseSlotLocation!) {
    activeAds(slotLocation: $slotLocation) {
      id
      internalId
      slotType
      slotLocation
      slotPriority
      graphic
      displayTitle
      targetUrl
      isActive
    }
  }
`);

export const MutationRecordAdImpressions = graphql(`
  mutation RecordAdImpressions($events: [AdvertiseImpressionInput!]!) {
    recordAdImpressions(events: $events)
  }
`);

export const MutationRecordAdClick = graphql(`
  mutation RecordAdClick(
    $creativeId: Int!
    $slotLocation: AdvertiseSlotLocation!
  ) {
    recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)
  }
`);
