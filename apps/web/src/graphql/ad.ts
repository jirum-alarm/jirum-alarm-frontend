import { gql } from '@apollo/client';

export const QueryActiveAds = gql`
  query activeAds($slotLocation: AdvertiseSlotLocation!) {
    activeAds(slotLocation: $slotLocation) {
      id
      slotType
      slotLocation
      slotPriority
      graphic
      displayPrice {
        discountText
        originalPrice
        displayPrice
      }
      displayTitle
      targetUrl
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
