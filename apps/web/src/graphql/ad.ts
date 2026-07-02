import { gql } from '@apollo/client';

export const QueryActiveAds = gql`
  query activeAds($slotLocation: AdvertiseSlotLocation!) {
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
`;

export const MutationRecordAdImpressions = gql`
  mutation recordAdImpressions($events: [AdvertiseImpressionInput!]!) {
    recordAdImpressions(events: $events)
  }
`;

export const MutationRecordAdClick = gql`
  mutation recordAdClick($creativeId: Int!, $slotLocation: AdvertiseSlotLocation!) {
    recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)
  }
`;
