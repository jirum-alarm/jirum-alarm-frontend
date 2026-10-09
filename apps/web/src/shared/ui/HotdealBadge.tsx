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
        `text-fixed-white flex h-6 w-[57px] items-center justify-center text-sm font-semibold`,
        {
          'rounded-lg': badgeVariant === 'page',
          'rounded-tr-lg rounded-bl-lg': badgeVariant === 'card',
          /* eslint-disable no-restricted-syntax -- 핫딜 배지 그라데이션 정지점(앱 HotdealBadge 와 같은 값) */
          'bg-linear-to-r from-[#F19824] from-0% via-[#E15A00] via-51% to-[#E68B13] to-100%':
            hotdealType === HotDealType.HotDeal,
          'via-error-500 bg-linear-to-r from-[#F76C7C] from-0% via-56% to-[#F76C7C] to-100%':
            hotdealType === HotDealType.SuperDeal,
          'from-error-500 to-error-500 w-[62px] bg-linear-to-r from-0% via-[#BB0016] via-48% to-100%':
            hotdealType === HotDealType.UltraDeal,
          /* eslint-enable no-restricted-syntax */
        },
      )}
    >
      {hotdealTextMap[hotdealType]}
    </div>
  );
};

export default HotdealBadge;
