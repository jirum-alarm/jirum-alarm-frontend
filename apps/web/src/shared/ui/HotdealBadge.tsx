import { HotDealType } from '@/shared/api/gql/graphql';
import { hotdealTextMap } from '@/shared/config/hotdeal';
import { cn } from '@/shared/lib/cn';

const HotdealBadge = ({
  hotdealType,
  badgeVariant,
}: {
  hotdealType: HotDealType;
  badgeVariant: 'page' | 'card';
}) => {
  return (
    <div
      className={cn(
        `typography-body-14sb text-fg-inverse flex h-6 w-[57px] items-center justify-center`,
        {
          'rounded-[8px]': badgeVariant === 'page',
          'rounded-tr-[8px] rounded-bl-[8px]': badgeVariant === 'card',
          'bg-linear-to-r from-[#F19824] from-0% via-[#E15A00] via-51% to-[#E68B13] to-100%':
            hotdealType === HotDealType.HotDeal,
          'via-error-500 bg-linear-to-r from-[#F76C7C] from-0% via-56% to-[#F76C7C] to-100%':
            hotdealType === HotDealType.SuperDeal,
          'from-error-500 to-error-500 w-[62px] bg-linear-to-r from-0% via-[#BB0016] via-48% to-100%':
            hotdealType === HotDealType.UltraDeal,
        },
      )}
    >
      {hotdealTextMap[hotdealType]}
    </div>
  );
};

export default HotdealBadge;
