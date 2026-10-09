import { sheet } from '@jirum/design-system/recipes';
import { VisuallyHidden } from 'radix-ui';
import { Drawer } from 'vaul';

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
 */
export const BottomSheetContent = ({
  handle = false,
  srTitle,
  className,
  children,
  ...rest
}: BottomSheetContentProps) => (
  <Drawer.Portal>
    <Drawer.Overlay className={cn('fixed inset-0 z-[9999]', sheet.overlay)} />
    <Drawer.Content
      {...rest}
      className={cn(
        'max-w-mobile-max fixed inset-x-0 bottom-0 z-[9999] mx-auto h-fit w-full outline-hidden',
        sheet.panel,
        handle && 'pt-3',
        className,
      )}
    >
      {srTitle && (
        <VisuallyHidden.Root>
          <Drawer.Title>{srTitle}</Drawer.Title>
        </VisuallyHidden.Root>
      )}
      {handle && <div aria-hidden className={cn(sheet.handle, 'mb-5')} />}
      {children}
    </Drawer.Content>
  </Drawer.Portal>
);
