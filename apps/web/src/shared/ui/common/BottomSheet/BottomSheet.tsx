'use client';

import { sheet } from '@jirum/design-system/recipes';
import { VisuallyHidden } from 'radix-ui';
import { Drawer } from 'vaul';

import { useDevice } from '@/shared/hooks/useDevice';
import { cn } from '@/shared/lib/cn';

import type { ComponentProps } from 'react';

export type BottomSheetContentProps = ComponentProps<typeof Drawer.Content> & {
  /** 끌어서 닫을 수 있다는 손잡이. 켜면 판 위쪽 여백도 손잡이에 맞춘다. */
  handle?: boolean;
  /** 화면에 안 보이는 제목(스크린리더) — 보이는 제목(Drawer.Title)이 없는 시트용. */
  srTitle?: string;
};

/**
 * 아래에서 올라오는 시트의 겉(가림막·판·손잡이). vaul `Drawer.Root` 안에 둔다.
 * 모양은 @jirum/design-system recipes 의 sheet — 앱 BottomSheet 와 같은 값.
 * 예전엔 시트마다 가림막·판 클래스를 그대로 복사해 11벌이었다. 안쪽 여백·높이는 내용마다 달라 className 으로.
 *
 * PC(데스크톱 레이아웃 = UA 판정, (desktop-ready)/layout 의 `pc` 와 같은 기준)는 화면 가운데 카드로 띄운다 —
 * 넓은 화면 바닥에 폰 폭(max-w-mobile-max) 띠가 붙어 올라오던 것(2026-10-16 지적). 포털이 `.pc` 밖(body)에
 * 그려져 `pc:` 변형이 안 먹어서 여기서 직접 가른다. vaul 의 `::after`(판 아래로 200% 이어 붙는 같은 색 면)는
 * 가운데 카드 밑에 흰 띠로 보이므로 끈다. 등장 애니메이션(transform)은 위치(translate)와 따로라 그대로 둔다.
 */
export const BottomSheetContent = ({
  handle = false,
  srTitle,
  className,
  children,
  ...rest
}: BottomSheetContentProps) => {
  const {
    device: { isMobile },
  } = useDevice();

  return (
    <Drawer.Portal>
      <Drawer.Overlay className={cn('fixed inset-0 z-80', sheet.overlay)} />
      <Drawer.Content
        {...rest}
        className={cn(
          'fixed z-80 h-fit w-full outline-hidden',
          isMobile
            ? ['max-w-mobile-max inset-x-0 bottom-0 mx-auto', sheet.panel, handle && 'pt-3']
            : [
                'top-1/2 left-1/2 max-h-[85dvh] max-w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-xl after:hidden dark:border dark:border-gray-100',
                // 손잡이(pt-3 + 높이 4 + mb-5)가 차지하던 윗여백을 그대로 남긴다.
                handle && 'pt-8',
              ],
          className,
        )}
      >
        {srTitle && (
          <VisuallyHidden.Root>
            <Drawer.Title>{srTitle}</Drawer.Title>
          </VisuallyHidden.Root>
        )}
        {handle && isMobile && <div aria-hidden className={cn(sheet.handle, 'mb-5')} />}
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
};
