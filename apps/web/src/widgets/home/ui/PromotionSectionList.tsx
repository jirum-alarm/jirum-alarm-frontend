import { Fragment, Suspense } from 'react';

import { type TossDeal } from '@/app/(desktop-ready)/toss/mock';

import { PromotionSection } from '@/entities/promotion/model/types';

import DesktopThemeSection from './desktop/ThemeSection';
import DynamicProductSection from './DynamicProductSection';
import HomeEndCta from './HomeEndCta';
import ThemeCarousel from './mobile/ThemeCarousel';
import RecommendedKeywordSection from './RecommendedKeywordSection';
import TossHomeSection from './TossHomeSection';

interface PromotionSectionListProps {
  sections: PromotionSection[];
  isMobile: boolean;
  /** 토스 특가 첫 탭 — 서버에서 받아 첫 렌더에 그린다 */
  tossInitialDeals?: TossDeal[];
}

// 알림 묶음 섹션을 이 프로모션 섹션 id 뒤에 끼운다. 인기 키워드 칩 바로 아래 — "키워드 하나씩"
// 대신 "묶음으로 한 번에" 를 이어서 제안한다.
const THEME_AFTER_SECTION_ID = 'under-10000';

// 인기 키워드 추천 칩을 이 섹션 뒤에 끼운다. 상위 세 섹션(핫딜·취향저격·만원이하)을
// 지나 딜을 충분히 둘러본 뒤라 "이런 거 놓치기 싫으면 알림" 제안이 맥락에 맞는다.
const KEYWORD_AFTER_SECTION_ID = 'under-10000';

const PromotionSectionList = ({
  sections,
  isMobile,
  tossInitialDeals,
}: PromotionSectionListProps) => {
  let isFirst = true;

  const renderKeywordSlot = (sectionId: string) =>
    sectionId === KEYWORD_AFTER_SECTION_ID ? <RecommendedKeywordSection /> : null;

  // 6/25~9/27 홈 노출 보류였다 — 테마 키워드를 즉시 매칭하면 구독 1건이 주당 100~1,800건이라.
  // 서버가 반응 상위만 하루 3건 보내도록 바뀐 뒤(crawling-server sendThemeDigest) 다시 연다.
  const renderThemeSlot = (sectionId: string) =>
    sectionId === THEME_AFTER_SECTION_ID ? (
      <Suspense fallback={null}>{isMobile ? <ThemeCarousel /> : <DesktopThemeSection />}</Suspense>
    ) : null;

  return (
    <div className="flex flex-col gap-y-8">
      {sections.map((section) => {
        if (section.type === 'TOSS') {
          isFirst = false;
          return (
            <Fragment key={section.id}>
              <TossHomeSection initialDeals={tossInitialDeals} />
            </Fragment>
          );
        }
        if (section.type === 'GROUP') {
          const priority = isFirst ? 4 : 0;
          isFirst = false;
          return (
            <Fragment key={section.id}>
              <div className="pc:grid pc:grid-cols-2 pc:gap-x-5 flex flex-col gap-y-8">
                {section.sections.map((subSection) => (
                  <DynamicProductSection
                    key={subSection.id}
                    section={subSection}
                    isMobile={isMobile}
                    priorityCount={priority}
                  />
                ))}
              </div>
              {renderThemeSlot(section.id)}
            </Fragment>
          );
        }
        const priority = isFirst ? 4 : 0;
        isFirst = false;
        return (
          <Fragment key={section.id}>
            <DynamicProductSection section={section} isMobile={isMobile} priorityCount={priority} />
            {renderKeywordSlot(section.id)}
            {renderThemeSlot(section.id)}
          </Fragment>
        );
      })}
      <HomeEndCta />
    </div>
  );
};

export default PromotionSectionList;
