import { useMutation, useQuery } from '@apollo/client/react';

import {
  AdReportQuery,
  AdReportQueryVariables,
  CreateAdAssetUploadUrlMutation,
  CreateAdAssetUploadUrlMutationVariables,
  CreateAdMutation,
  SetAdActiveMutation,
  SetAdActiveMutationVariables,
  UpdateAdMutation,
} from '@/generated/gql/graphql';
import {
  MutationCreateAd,
  MutationCreateAdAssetUploadUrl,
  MutationSetAdActive,
  MutationUpdateAd,
  QueryAdReport,
  QueryAdsByAdmin,
} from '@/graphql/advertisement';

import { QueryOptions } from './options';

// ── graphic 타입 (백엔드 advertise-graphic.interface 와 1:1, JSON scalar) ──
// graphic 은 스키마상 JSONObject(생성 타입 any)이고 slotType/slotLocation 은 문자열 유니온으로 쓰고 있어,
// 광고 목록 응답(AdCreative)·생성/수정 입력(CreateAdInput)은 생성 타입 대신 손으로 둔다

export interface GraphicSize {
  width: number;
  height: number;
}

export type ElementLayoutSize = Partial<Record<keyof GraphicSize, number | null>>;

export interface ElementConstraints {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export type ResponsiveValueMap<T> = {
  _default: T;
} & Partial<Record<`${'>=' | '<='}${number}`, T>>;

export type ResponsiveOverrideMap<T> = Partial<Record<'_default' | `${'>=' | '<='}${number}`, T>>;

export interface AdvertiseAsset {
  designSize: GraphicSize;
  assetUrl: string;
  assetByWidth?: ResponsiveOverrideMap<string>;
}

export type AdvertiseElementAsset = AdvertiseAsset & {
  visibleByWidth?: ResponsiveOverrideMap<boolean>;
  layoutByWidth: ResponsiveValueMap<{
    constraints: ElementConstraints;
    size?: ElementLayoutSize;
  }>;
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
  | 'product_main_banner'
  | 'siwol_promotion_enter';

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

export interface CreateAdInput {
  internalId: string;
  startAt: string;
  endAt: string;
  slotType: AdSlotType;
  slotLocation: AdSlotLocation[];
  slotPriority?: number;
  graphic: ResponsiveAdvertiseGraphic;
  displayPrice?: AdvertisePrice;
  // null = 제목 비우기(스키마 InputMaybe). undefined 는 수정 시 "안 건드림" 이다
  displayTitle?: string | null;
  targetUrl: string;
  isActive?: boolean;
}

export type UpdateAdInput = Partial<CreateAdInput>;

// ── hooks ──

export const useAdsByAdmin = (
  variables?: { slotLocation?: AdSlotLocation; isActive?: boolean },
  options?: QueryOptions<{ adsByAdmin: AdCreative[] }>,
) =>
  useQuery<{ adsByAdmin: AdCreative[] }>(QueryAdsByAdmin, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });

export const useAdReport = (
  variables: AdReportQueryVariables,
  options?: QueryOptions<AdReportQuery, AdReportQueryVariables>,
) =>
  useQuery<AdReportQuery, AdReportQueryVariables>(QueryAdReport, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });

export const useCreateAdAssetUploadUrl = (
  options?: useMutation.Options<
    CreateAdAssetUploadUrlMutation,
    CreateAdAssetUploadUrlMutationVariables
  >,
) =>
  useMutation<CreateAdAssetUploadUrlMutation, CreateAdAssetUploadUrlMutationVariables>(
    MutationCreateAdAssetUploadUrl,
    options,
  );

export const useCreateAd = (
  options?: useMutation.Options<CreateAdMutation, { input: CreateAdInput }>,
) =>
  useMutation<CreateAdMutation, { input: CreateAdInput }>(MutationCreateAd, {
    refetchQueries: [{ query: QueryAdsByAdmin, variables: {} }],
    ...options,
  });

export const useUpdateAd = (
  options?: useMutation.Options<UpdateAdMutation, { id: number; input: UpdateAdInput }>,
) =>
  useMutation<UpdateAdMutation, { id: number; input: UpdateAdInput }>(MutationUpdateAd, {
    refetchQueries: [{ query: QueryAdsByAdmin, variables: {} }],
    ...options,
  });

export const useSetAdActive = (
  options?: useMutation.Options<SetAdActiveMutation, SetAdActiveMutationVariables>,
) =>
  useMutation<SetAdActiveMutation, SetAdActiveMutationVariables>(MutationSetAdActive, {
    refetchQueries: [{ query: QueryAdsByAdmin, variables: {} }],
    ...options,
  });
