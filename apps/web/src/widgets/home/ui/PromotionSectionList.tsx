import { PromotionSection } from '@/entities/promotion';

import DynamicProductSection from './DynamicProductSection';

interface PromotionSectionListProps {
  sections: PromotionSection[];
}

const sortByDisplayOrder = <T extends { displayOrder: number }>(items: T[]) =>
  [...items].sort((a, b) => a.displayOrder - b.displayOrder);

const PromotionSectionList = ({ sections }: PromotionSectionListProps) => {
  const orderedSections = sortByDisplayOrder(
    sections.map((section) =>
      section.type === 'GROUP'
        ? { ...section, sections: sortByDisplayOrder(section.sections) }
        : section,
    ),
  );

  return (
    <div className="flex flex-col gap-y-8">
      {orderedSections.map((section) => {
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
