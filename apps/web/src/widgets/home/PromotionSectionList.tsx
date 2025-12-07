import { PromotionSection } from '@entities/promotion/model/types';

import DynamicProductSection from './DynamicProductSection';

interface PromotionSectionListProps {
  sections: PromotionSection[];
}

const PromotionSectionList = ({ sections }: PromotionSectionListProps) => {
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
                <DynamicProductSection key={subSection.id} section={subSection} />
              ))}
            </div>
          );
        }
        return <DynamicProductSection key={section.id} section={section} />;
      })}
    </div>
  );
};

export default PromotionSectionList;
