'use client';

import { Drawer } from 'vaul';

import { type HotDealType } from '@/shared/api/gql/graphql';
import { HOTDEAL_TYPES_IN_ORDER, hotdealCriteria, hotdealTextMap } from '@/shared/config/hotdeal';
import { cn } from '@/shared/lib/cn';
import { BottomSheetContent } from '@/shared/ui/common/BottomSheet';
import Button from '@/shared/ui/common/Button';
import HotdealBadge from '@/shared/ui/HotdealBadge';

/**
 * 상세 배지 + 뜻 한 줄 — 누르면 세 배지의 기준을 시트로 보여 준다(2026-10-12).
 *
 * 10/10 에 옛 안내 시트(「AI 가 기존 가격과 비교해 3단계」)를 지웠다 — 배지 95%가 커뮤니티 인기글이라 사실이 아니었다.
 * 이제 기준이 서버 한 곳(hot-deal-criteria.ts)에 숫자로 있어 그 문장을 그대로 보여 준다. 이 딜의 구체적 근거는
 * 가격 아래 근거 블록이 말한다.
 */
export default function HotdealCriteriaBadge({ hotdealType }: { hotdealType: HotDealType }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="-my-1 flex min-w-0 items-center gap-1.5 py-1"
          aria-label={`${hotdealTextMap[hotdealType]} — ${hotdealCriteria[hotdealType].title}. 배지 기준 보기`}
        >
          <HotdealBadge badgeVariant="page" hotdealType={hotdealType} />
          <span className="truncate text-xs text-gray-500">
            {hotdealCriteria[hotdealType].short} ›
          </span>
        </button>
      </Drawer.Trigger>
      <BottomSheetContent className="px-5 pt-8 pb-5">
        <Drawer.Title asChild>
          <h2 className="text-xl font-bold text-gray-900">배지는 이렇게 붙어요</h2>
        </Drawer.Title>
        <Drawer.Description className="pt-1 pb-4 text-sm text-gray-500">
          둘 이상 해당하면 높은 배지 하나만 보여요.
        </Drawer.Description>
        <ul className="space-y-1">
          {HOTDEAL_TYPES_IN_ORDER.map((type) => (
            <li
              key={type}
              className={cn(
                'flex gap-3 rounded-lg px-3 py-3',
                type === hotdealType && 'bg-gray-50',
              )}
            >
              <div className="w-[62px] shrink-0">
                <HotdealBadge badgeVariant="page" hotdealType={type} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {hotdealCriteria[type].title}
                  {type === hotdealType ? (
                    <span className="text-error-600 ml-1.5 text-xs font-medium">이 딜</span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{hotdealCriteria[type].detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <Drawer.Close asChild>
          <Button className="mt-6">확인</Button>
        </Drawer.Close>
      </BottomSheetContent>
    </Drawer.Root>
  );
}
