import { gql } from '@apollo/client';

export const QueryAdsByAdmin = gql`
  query AdsByAdmin($slotLocation: AdvertiseSlotLocation, $isActive: Boolean) {
    adsByAdmin(slotLocation: $slotLocation, isActive: $isActive) {
      id
      internalId
      startAt
      endAt
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
      isActive
      createdAt
      modifiedAt
    }
  }
`;

export const QueryAdReport = gql`
  query AdReport($from: DateTime!, $to: DateTime!, $creativeId: Int) {
    adReport(from: $from, to: $to, creativeId: $creativeId) {
      creativeId
      internalId
      slotLocation
      impressions
      clicks
      ctr
    }
  }
`;

export const QueryActiveAds = gql`
  query ActiveAds($slotLocation: AdvertiseSlotLocation!) {
    activeAds(slotLocation: $slotLocation) {
      id
      internalId
      startAt
      endAt
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
      isActive
      createdAt
      modifiedAt
    }
  }
`;

export const MutationRecordAdImpressions = gql`
  mutation RecordAdImpressions($events: [AdvertiseImpressionInput!]!) {
    recordAdImpressions(events: $events)
  }
`;

export const MutationRecordAdClick = gql`
  mutation RecordAdClick($creativeId: Int!, $slotLocation: AdvertiseSlotLocation!) {
    recordAdClick(creativeId: $creativeId, slotLocation: $slotLocation)
  }
`;

export const MutationCreateAdAssetUploadUrl = gql`
  mutation CreateAdAssetUploadUrl($contentType: String!) {
    createAdAssetUploadUrl(contentType: $contentType) {
      uploadUrl
      assetUrl
    }
  }
`;

export const MutationCreateAd = gql`
  mutation CreateAd($input: CreateAdvertiseInput!) {
    createAd(input: $input)
  }
`;

export const MutationUpdateAd = gql`
  mutation UpdateAd($id: Int!, $input: UpdateAdvertiseInput!) {
    updateAd(id: $id, input: $input)
  }
`;

export const MutationSetAdActive = gql`
  mutation SetAdActive($id: Int!, $isActive: Boolean!) {
    setAdActive(id: $id, isActive: $isActive)
  }
`;
