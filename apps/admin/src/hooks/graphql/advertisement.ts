import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import {
  MutationCreateAd,
  MutationCreateAdAssetUploadUrl,
  MutationSetAdActive,
  MutationUpdateAd,
  QueryAdReport,
  QueryAdsByAdmin,
} from '@/graphql/advertisement';

// ── graphic 타입 (백엔드 advertise-graphic.interface 와 1:1, JSON scalar) ──

export interface GraphicSize {
  width: number;
  height: number;
}

export interface ElementConstraints {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export type ResponsiveValueMap<T> = {
  _default: T;
} & Partial<Record<`<=${number}`, T>>;

export interface AdvertiseAsset {
  designSize: GraphicSize;
  assetUrl: string;
}

export type AdvertiseElementAsset = AdvertiseAsset & {
  layoutByWidth: ResponsiveValueMap<{ constraints: ElementConstraints; size: GraphicSize }>;
};

export interface ResponsiveAdvertiseGraphic {
  size: ResponsiveValueMap<GraphicSize>;
  background: AdvertiseAsset;
  foregroundElements: AdvertiseElementAsset[];
}

export interface AdvertisePrice {
  discountText?: string;
  originalPrice?: string;
  displayPrice: string;
}

export type AdSlotType = 'banner' | 'pinnedProduct';
export type AdSlotLocation =
  | 'home_carousel_banner'
  | 'home_main_banner'
  | 'home_ranking_product'
  | 'product_main_banner';

export interface AdCreative {
  id: string;
  internalId: string;
  startAt: string;
  endAt: string;
  slotType: AdSlotType;
  slotLocation: AdSlotLocation[];
  slotPriority: number;
  graphic: ResponsiveAdvertiseGraphic;
  displayPrice?: AdvertisePrice | null;
  displayTitle?: string | null;
  targetUrl: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface AdReportRow {
  creativeId: number;
  internalId: string;
  slotLocation: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface CreateAdInput {
  internalId: string;
  startAt: string;
  endAt: string;
  slotType: AdSlotType;
  slotLocation: AdSlotLocation[];
  slotPriority?: number;
  graphic: ResponsiveAdvertiseGraphic;
  displayPrice?: AdvertisePrice;
  displayTitle?: string;
  targetUrl: string;
  isActive?: boolean;
}

export type UpdateAdInput = Partial<CreateAdInput>;

// ── hooks ──

export const useAdsByAdmin = (
  variables?: { slotLocation?: AdSlotLocation; isActive?: boolean },
  options?: QueryHookOptions,
) =>
  useQuery<{ adsByAdmin: AdCreative[] }>(QueryAdsByAdmin, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });

export const useAdReport = (
  variables: { from: string; to: string; creativeId?: number },
  options?: QueryHookOptions,
) =>
  useQuery<{ adReport: AdReportRow[] }>(QueryAdReport, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });

export const useCreateAdAssetUploadUrl = (
  options?: MutationHookOptions<
    { createAdAssetUploadUrl: { uploadUrl: string; assetUrl: string } },
    { contentType: string }
  >,
) =>
  useMutation<
    { createAdAssetUploadUrl: { uploadUrl: string; assetUrl: string } },
    { contentType: string }
  >(MutationCreateAdAssetUploadUrl, options);

export const useCreateAd = (
  options?: MutationHookOptions<{ createAd: number }, { input: CreateAdInput }>,
) =>
  useMutation<{ createAd: number }, { input: CreateAdInput }>(MutationCreateAd, {
    refetchQueries: [{ query: QueryAdsByAdmin, variables: {} }],
    ...options,
  });

export const useUpdateAd = (
  options?: MutationHookOptions<{ updateAd: boolean }, { id: number; input: UpdateAdInput }>,
) =>
  useMutation<{ updateAd: boolean }, { id: number; input: UpdateAdInput }>(MutationUpdateAd, {
    refetchQueries: [{ query: QueryAdsByAdmin, variables: {} }],
    ...options,
  });

export const useSetAdActive = (
  options?: MutationHookOptions<{ setAdActive: boolean }, { id: number; isActive: boolean }>,
) =>
  useMutation<{ setAdActive: boolean }, { id: number; isActive: boolean }>(MutationSetAdActive, {
    refetchQueries: [{ query: QueryAdsByAdmin, variables: {} }],
    ...options,
  });
