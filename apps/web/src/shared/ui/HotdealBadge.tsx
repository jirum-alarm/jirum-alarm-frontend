import { hotdealTextMap } from '@/constants/hotdeal';
import { cn } from '@/lib/cn';

import { HotDealType } from '@shared/api/gql/graphql';

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
        `flex h-6 w-[57px] items-center justify-center text-sm font-semibold text-white`,
        {
          'rounded-[8px]': badgeVariant === 'page',
          'rounded-tr-[8px] rounded-bl-[8px]': badgeVariant === 'card',
          'bg-linear-to-r from-[#F19824] from-0% via-[#E15A00] via-51% to-[#E68B13] to-100%':
            hotdealType === HotDealType.HotDeal,
          'bg-linear-to-r from-[#F76C7C] from-0% via-[#EB001C] via-56% to-[#F76C7C] to-100%':
            hotdealType === HotDealType.SuperDeal,
          'w-[62px] bg-linear-to-r from-[#EB001C] from-0% via-[#BB0016] via-48% to-[#EB001C] to-100%':
            hotdealType === HotDealType.UltraDeal,
        },
      )}
    >
      {hotdealTextMap[hotdealType]}
    </div>
  );
};

export default HotdealBadge;
