import { Fragment, Suspense } from 'react';

import { PromotionSection } from '@/entities/promotion/model/types';

import DesktopThemeSection from './desktop/ThemeSection';
import DynamicProductSection from './DynamicProductSection';
import ThemeCarousel from './mobile/ThemeCarousel';

interface PromotionSectionListProps {
  sections: PromotionSection[];
  isMobile: boolean;
}

// 알림 묶음 섹션을 이 프로모션 섹션 id 뒤에 끼운다.
const THEME_AFTER_SECTION_ID = 'under-10000';

const PromotionSectionList = ({ sections, isMobile }: PromotionSectionListProps) => {
  let isFirst = true;

  const renderThemeSlot = (sectionId: string) =>
    sectionId === THEME_AFTER_SECTION_ID ? (
      <Suspense fallback={null}>{isMobile ? <ThemeCarousel /> : <DesktopThemeSection />}</Suspense>
    ) : null;

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
            <DynamicProductSection section={section} isMobile={isMobile} priorityCount={priority} />
            {renderThemeSlot(section.id)}
          </Fragment>
        );
      })}
    </div>
  );
};

export default PromotionSectionList;
