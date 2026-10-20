import {
  buildFallbackPromotionSections,
  findPromotionSectionById,
} from '@jirum/domain/home-sections';

import { PromotionService } from '@/shared/api/promotion';

import { mapHomePageSections } from '../lib/map-home-page';
import { ContentPromotionSection, PromotionSection } from '../model/types';

// 섹션 구성·폴백 카탈로그·id 찾기는 정본 @jirum/domain/home-sections(앱과 같은 코드). 여기는 서버에서 받아 오는 일만.
export const getPromotionSections = async (): Promise<PromotionSection[]> => {
  try {
    const page = await PromotionService.getHomePage();
    const sections = mapHomePageSections(page.sections);
    if (sections.length > 0) return sections;
  } catch {
    // 구스키마/일시 오류면 로컬 카탈로그로 폴백
  }
  return getLocalPromotionSections();
};

const getLocalPromotionSections = async (): Promise<PromotionSection[]> => {
  const [providersResult, mallGroupsResult] = await Promise.allSettled([
    PromotionService.getCommunityProviders(),
    PromotionService.getMallGroups(),
  ]);
  return buildFallbackPromotionSections({
    communityProviders:
      providersResult.status === 'fulfilled' ? providersResult.value.communityProviders : [],
    mallGroups: mallGroupsResult.status === 'fulfilled' ? mallGroupsResult.value.mallGroups : [],
  });
};

export const getPromotionSectionById = async (
  id: string,
): Promise<ContentPromotionSection | undefined> =>
  findPromotionSectionById(await getPromotionSections(), id);
