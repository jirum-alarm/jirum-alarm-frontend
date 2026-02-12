import { PromotionSection } from '@/entities/promotion/model/types';

import DynamicProductSection from './DynamicProductSection';

interface PromotionSectionListProps {
  sections: PromotionSection[];
  isMobile: boolean;
}

const PromotionSectionList = ({ sections, isMobile }: PromotionSectionListProps) => {
  return (
    <div className="flex flex-col gap-y-8">
      {sections.map((section) => {
        if (section.type === 'GROUP') {
          return (
            <div
              key={section.id}
              className="pc:grid pc:grid-cols-2 pc:gap-x-5 flex flex-col gap-y-8"
            >
              {section.sections.map((subSection) => (
                <DynamicProductSection
                  key={subSection.id}
                  section={subSection}
                  isMobile={isMobile}
                />
              ))}
            </div>
          );
        }
        return <DynamicProductSection key={section.id} section={section} isMobile={isMobile} />;
      })}
    </div>
  );
};

export default PromotionSectionList;
