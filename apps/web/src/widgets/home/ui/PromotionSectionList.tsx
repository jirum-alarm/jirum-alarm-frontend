import { Fragment } from 'react';

import { PromotionSection } from '@/entities/promotion/model/types';

import DynamicProductSection from './DynamicProductSection';
import TossHomeSection from './TossHomeSection';
// 홈 노출 보류: 테마 섹션 import 임시 제거 (renderThemeSlot 되살릴 때 함께 복구)
// import { Suspense } from 'react';
// import DesktopThemeSection from './desktop/ThemeSection';
// import ThemeCarousel from './mobile/ThemeCarousel';

interface PromotionSectionListProps {
  sections: PromotionSection[];
  isMobile: boolean;
}

// 알림 묶음 섹션을 이 프로모션 섹션 id 뒤에 끼운다. (홈 노출 보류로 현재 미사용)
// const THEME_AFTER_SECTION_ID = 'under-10000';

const PromotionSectionList = ({ sections, isMobile }: PromotionSectionListProps) => {
  let isFirst = true;

  // 홈 노출 보류: 알림 묶음(테마) 섹션을 홈에서만 임시 제거. /themes 직접진입·mypage 구독관리는 유지.
  // 되살리려면 아래 주석 본문 복구.
  const renderThemeSlot = (_sectionId: string) => null;
  // const renderThemeSlot = (sectionId: string) =>
  //   sectionId === THEME_AFTER_SECTION_ID ? (
  //     <Suspense fallback={null}>{isMobile ? <ThemeCarousel /> : <DesktopThemeSection />}</Suspense>
  //   ) : null;

  return (
    <div className="flex flex-col gap-y-8">
      {sections.map((section) => {
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
            {section.id === 'hotdeal' && <TossHomeSection />}
            <DynamicProductSection section={section} isMobile={isMobile} priorityCount={priority} />
            {renderThemeSlot(section.id)}
          </Fragment>
        );
      })}
    </div>
  );
};

export default PromotionSectionList;
