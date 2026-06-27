import { gql } from '@apollo/client';

const AD_CREATIVE_FIELDS = `
  id
  internalId
  startAt
  endAt
  slotType
  slotLocation
  slotPriority
  graphic
  displayPrice
  displayTitle
  targetUrl
  isActive
  createdAt
  modifiedAt
`;

export const QueryAdsByAdmin = gql`
  query AdsByAdmin($slotLocation: AdSlotLocation, $isActive: Boolean) {
    adsByAdmin(slotLocation: $slotLocation, isActive: $isActive) {
      ${AD_CREATIVE_FIELDS}
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

export const MutationCreateAdAssetUploadUrl = gql`
  mutation CreateAdAssetUploadUrl($contentType: String!) {
    createAdAssetUploadUrl(contentType: $contentType) {
      uploadUrl
      assetUrl
    }
  }
`;

export const MutationCreateAd = gql`
  mutation CreateAd($input: CreateAdInput!) {
    createAd(input: $input)
  }
`;

export const MutationUpdateAd = gql`
  mutation UpdateAd($id: Int!, $input: UpdateAdInput!) {
    updateAd(id: $id, input: $input)
  }
`;

export const MutationSetAdActive = gql`
  mutation SetAdActive($id: Int!, $isActive: Boolean!) {
    setAdActive(id: $id, isActive: $isActive)
  }
`;
