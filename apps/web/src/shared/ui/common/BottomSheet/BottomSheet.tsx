'use client';

import { VisuallyHidden } from 'radix-ui';
import { Drawer } from 'vaul';

import { cn } from '@/shared/lib/cn';

import type { ComponentProps, ReactNode } from 'react';

/**
 * 바텀시트 — vaul Drawer 위 얇은 래퍼. Overlay/Content 보일러플레이트(고정 위치·z-index·
 * max-width·radius·배경 토큰)를 표준화해 7곳에 흩어진 중복을 제거한다.
 *
 * - 접근성: `title`을 주면 VisuallyHidden Drawer.Title로 숨겨 넣는다(스크린리더용).
 *   화면에 제목을 보여주려면 children 안에서 직접 마크업하고 title은 접근성용으로만 둔다.
 * - Root props(open/onOpenChange/...)는 그대로 통과. Trigger는 BottomSheet.Trigger로.
 * - 높이 등 변형은 contentClassName으로 override(기본 h-fit).
 */
type BottomSheetProps = ComponentProps<typeof Drawer.Root> & {
  children: ReactNode;
  /** 시트를 여는 트리거. vaul 구조상 Root 직계여야 하므로 children(=Content)과 분리해서 받는다.
      제어형(open/onOpenChange)만 쓰면 생략. asChild는 내부에서 처리. */
  trigger?: ReactNode;
  /** 스크린리더용 접근성 제목(시각적으로 숨김). 화면 제목은 children에서 직접. */
  title?: string;
  /** Drawer.Content className override (높이 등). 기본값에 cn으로 합쳐짐. */
  contentClassName?: string;
};

const BottomSheet = ({
  children,
  trigger,
  title,
  contentClassName,
  ...rootProps
}: BottomSheetProps) => {
  return (
    <Drawer.Root {...rootProps}>
      {trigger ? <Drawer.Trigger asChild>{trigger}</Drawer.Trigger> : null}
      <Drawer.Portal>
        {title ? (
          <VisuallyHidden.Root>
            <Drawer.Title>{title}</Drawer.Title>
          </VisuallyHidden.Root>
        ) : null}
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content
          className={cn(
            'max-w-mobile-max bg-surface-default fixed inset-x-0 right-0 bottom-0 left-0 z-[9999] mx-auto h-fit rounded-t-[20px] outline-hidden',
            contentClassName,
          )}
        >
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default Object.assign(BottomSheet, {
  /** 시트 내부에서 닫기 버튼 등에 사용. */
  Close: Drawer.Close,
  /** 화면에 보이는 제목을 쓸 때(접근성 Title 겸용, asChild로 마크업 주입). title prop과 택일. */
  Title: Drawer.Title,
});
