import { toast } from '@jirum/design-system/recipes';
import { cva } from 'class-variance-authority';

import { cn } from '@/shared/lib/cn';

/**
 * 모양은 @jirum/design-system recipes 의 toast — 앱 AppToast 와 같은 짙은 판·왼쪽 정렬 글자.
 * 예전엔 가운데 정렬 gray-600 상자(280px)라 같은 알림이 web·앱에서 다르게 보였다.
 * 폭은 앱(mx-5)처럼 화면 양옆 20px 를 남기고, PC 에선 너무 넓지 않게 막는다.
 */
export const toastVariant = cva('', {
  variants: {
    variant: {
      default: cn(
        // z-90 = 토스트 층(layout.js) — 시트·확인 창(z-80) 위. pointer-events-auto: 모달이 열리면 vaul·Radix 가 body 에
        // pointer-events:none 을 걸어, 시트 위에서 띄운 토스트의 「보기」가 눌리지 않았다.
        'pointer-events-auto fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-90 flex w-[calc(100%-40px)] max-w-[440px] -translate-x-1/2 items-center gap-x-2 text-left',
        toast.box,
        toast.text,
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
