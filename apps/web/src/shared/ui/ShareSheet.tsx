'use client';

import { layout } from '@jirum/design-system/layout';
import { sheet, text } from '@jirum/design-system/recipes';
import { Dialog, VisuallyHidden } from 'radix-ui';
import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

import useScreen from '@/shared/hooks/useScreenSize';
import { cn } from '@/shared/lib/cn';
import { ensureKakao } from '@/shared/lib/kakao';
import {
  buildCaption,
  buildIntentUrl,
  buildShareMessage,
  buildShareUrl,
  type ShareChannel,
} from '@/shared/lib/share';
import { isInApp, shareNative, triggerHaptic } from '@/shared/lib/webview';
import { BottomSheetContent } from '@/shared/ui/common/BottomSheet';
import {
  Close as CloseIcon,
  Share,
  ShareLink,
  ShareThreads,
  ShareX,
} from '@/shared/ui/common/icons';
import SvgKakao from '@/shared/ui/common/icons/login/Kakao';
import { useToast } from '@/shared/ui/common/Toast';

// 공유 시트(모바일 바텀시트 / PC 가운데 모달). 위계는 앱 ShareSheet 와 같다:
// ① 무엇을(미리보기) ② 어디로(앱 줄 — 카톡 첫 칸) ③ 링크(주소가 보이는 복사 칸, 결과는 칸 안에서).
// "다른 앱"은 OS 시트 폴백이라 navigator.share 가 없는 환경(데스크톱 대부분)에서는 렌더하지 않는다.
type Props = {
  children: React.ReactNode;
  title: string;
  description?: string;
  imageUrl?: string;
};

// dataLayer(GTM) push — DealsTracking 패턴.
// ★GTM 컨테이너에 share_channel_click 을 등록해야 분석 도구에 도달한다(배선만으론 미도달).
const track = (channel: ShareChannel) => {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'share_channel_click',
    share_channel: channel,
  });
};

export default function ShareSheet({ children, title, description, imageUrl }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ShareChannel | null>(null);
  // md(768px) 이상 = PC. useScreen 은 초기값 false 라 SSR 안전.
  const { md: isDesktop } = useScreen();
  // SSR 엔 window 가 없어 마운트 후 판정해야 hydration mismatch 가 안 난다(ShareButton 관용구).
  const [canNativeShare, setCanNativeShare] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 주석대로 navigator 는 브라우저에만 있어 하이드레이션 뒤에 판정한다.
  useEffect(() => setCanNativeShare(isInApp() || !!navigator.share), []);
  const [copied, setCopied] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  // 링크 칸에 보이는 주소 — 프로토콜·쿼리(utm 등)를 뺀 사람이 읽는 꼴. 열릴 때 계산(SSR 엔 window 가 없다).
  const [displayUrl, setDisplayUrl] = useState('');

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setCopied(false);
    setThumbFailed(false);
    const { host, pathname } = window.location;
    setDisplayUrl(`${host}${pathname === '/' ? '' : pathname}`);
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(buildShareMessage(title, url, description));
      setCopied(true);
    } catch {
      toast.error(<>복사에 실패했어요. 주소창의 링크를 직접 복사해주세요.</>);
    }
  };

  const share = async (channel: ShareChannel) => {
    // 느린 망에서 SDK 다운로드가 길어지면 연속 탭이 sendDefault 를 여러 번 발사한다.
    if (pending) return;
    setPending(channel);
    triggerHaptic('light');
    track(channel);
    const url = buildShareUrl(window.location.href, channel);
    const caption = buildCaption(title, description);

    try {
      if (channel === 'kakao') {
        await ensureKakao();
        // ★sendScrap = 페이지의 OG 태그를 카톡이 직접 긁어 카드를 만든다.
        // 상세엔 generateMetadata 로 og:title/description/image + product:price:* 가 이미
        // 완비돼 있으므로(page.tsx), sendDefault 로 content 를 손조립하면 규격이 이중화되고
        // OG 가 바뀔 때마다 어긋난다. 규격은 OG 한 곳에서만 관리한다.
        window.Kakao.Share.sendScrap({ requestUrl: url });
      } else if (channel === 'native') {
        // 앱은 RN 브릿지, 웹은 Web Share API — shareNative 가 알아서 갈린다.
        await shareNative({ title, url, message: buildShareMessage(title, url, description) });
      } else if (channel === 'x' || channel === 'threads') {
        // 'noopener' 를 features 로 주면 열려도 항상 null 이 돌아와 매번 복사까지 했다.
        // 열린 창의 opener 를 직접 끊고, null(팝업 차단)일 때만 복사로 폴백한다.
        const opened = window.open(buildIntentUrl(channel, caption, url), '_blank');
        if (opened) opened.opener = null;
        else await copyLink(url);
      } else {
        // 복사는 시트 안에서 끝나는 동작 — 닫지 않고 칸에 「복사됨」을 보여 준다.
        await copyLink(url);
        return;
      }
      setOpen(false);
    } catch (e) {
      // 사용자가 시트를 닫은 것(AbortError)은 실패가 아니다.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      if (channel === 'kakao') {
        toast.error(<>카카오톡 공유를 열지 못했어요. 링크 복사를 이용해주세요.</>);
        return;
      }
      await copyLink(url);
    } finally {
      // catch 안에 early return 이 있어 finally 로 풀어야 잠금이 안 남는다.
      setPending(null);
    }
  };

  // 카톡은 앱 줄 첫 칸(국내 1순위) — 앱 ShareSheet 와 같은 위계: 무엇을 → 어디로 → 링크.
  // X·Threads 공식 배경은 검정이지만 다크에선 시트 바탕에 묻혀 회색 원(gray-100)으로 둔다.
  // a11y = 화면 읽기 이름. 조사까지 적는다(예전 「스레드 으 로 공유」).
  const channels: {
    c: Exclude<ShareChannel, 'copy'>;
    label: string;
    a11y: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      c: 'kakao',
      label: '카카오톡',
      a11y: '카카오톡으로 공유',
      icon: <SvgKakao width={26} height={26} />,
      badge: 'bg-kakao',
    },
    {
      c: 'x',
      label: 'X',
      a11y: 'X로 공유',
      icon: <ShareX width={20} height={20} className="text-fixed-white" />,
      badge: 'bg-black dark:bg-gray-100',
    },
    {
      c: 'threads',
      label: '스레드',
      a11y: '스레드로 공유',
      icon: <ShareThreads width={22} height={22} className="text-fixed-white" />,
      badge: 'bg-black dark:bg-gray-100',
    },
    // OS 시트 폴백(문자·인스타DM 등). 지원 안 하는 환경(데스크톱 대부분)에선 빼야
    // 눌러도 아무 일 없는 칸이 안 생긴다.
    ...(canNativeShare
      ? ([
          {
            c: 'native' as const,
            label: '다른 앱',
            a11y: '다른 앱으로 공유',
            icon: <Share width={20} height={20} className="text-gray-700" />,
            badge: 'bg-gray-100',
          },
        ] as const)
      : []),
  ];

  // 무엇을 공유하는지 — 링크만 있으면 뭘 보내는지 알 수 없다.
  const preview = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {imageUrl && !thumbFailed ? (
        // 외부 CDN 썸네일이라 next/image 대신 img — 도메인 화이트리스트 없이 뜨게.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="size-14 flex-none rounded-xl bg-gray-100 object-cover"
          onError={() => setThumbFailed(true)}
        />
      ) : (
        <span className="flex size-14 flex-none items-center justify-center rounded-xl bg-gray-100">
          <Share width={20} height={20} className="text-gray-400" />
        </span>
      )}
      <div className="min-w-0">
        <p className={cn('line-clamp-2 break-all', text.label)}>{title}</p>
        {description ? (
          <p className={cn('mt-0.5 line-clamp-1', text.caption)}>{description}</p>
        ) : null}
      </div>
    </div>
  );

  const body = (
    <>
      <div className="mt-6 flex">
        {channels.map(({ c, label, a11y, icon, badge }) => (
          <button
            key={c}
            type="button"
            onClick={() => share(c)}
            disabled={!!pending}
            aria-label={a11y}
            className="group flex flex-1 flex-col items-center gap-2 rounded-xl py-1 disabled:opacity-60"
          >
            <span
              className={cn(
                'flex size-14 items-center justify-center rounded-full transition group-hover:brightness-95 group-active:scale-95',
                badge,
              )}
            >
              {icon}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {pending === c ? '여는 중…' : label}
            </span>
          </button>
        ))}
      </div>

      {/* 링크 칸 — 무엇이 복사되는지 보이고, 결과도 시트 안에서 바로 보인다(토스트에 기대지 않음). */}
      <div className="mt-6 flex h-12 items-center gap-2 rounded-xl bg-gray-50 pr-1.5 pl-3.5">
        <ShareLink width={16} height={16} className="flex-none text-gray-500" />
        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{displayUrl}</span>
        <button
          type="button"
          onClick={() => share('copy')}
          disabled={!!pending}
          aria-live="polite"
          className={cn(
            'h-9 flex-none rounded-lg px-3.5 text-sm font-semibold transition-colors disabled:opacity-60',
            copied
              ? 'text-secondary-700 bg-secondary-50'
              : 'bg-gray-900 text-white hover:bg-gray-800',
          )}
        >
          {copied ? '복사됨' : '링크 복사'}
        </button>
      </div>
    </>
  );

  // PC 는 센터 모달, 모바일은 바텀시트 — 손이 닿는 위치가 달라 껍데기를 나눈다.
  const header = (CloseButton: typeof Dialog.Close | typeof Drawer.Close) => (
    <div className="flex items-start gap-2">
      {preview}
      <CloseButton
        aria-label="닫기"
        className="-mt-1 -mr-2 flex size-9 flex-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <CloseIcon width={20} height={20} />
      </CloseButton>
    </div>
  );

  // PC 는 센터 모달, 모바일은 바텀시트 — 손이 닿는 위치가 달라 껍데기만 나눈다.
  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn('fixed inset-0', sheet.overlay, layout.layerClass.overlay)}
          />
          <Dialog.Content
            aria-describedby={undefined}
            className={cn(
              'fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl outline-hidden dark:border dark:border-gray-100',
              layout.layerClass.overlay,
            )}
          >
            <VisuallyHidden.Root asChild>
              <Dialog.Title>공유하기</Dialog.Title>
            </VisuallyHidden.Root>
            {header(Dialog.Close)}
            {body}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      {/* pb 에 safe-area 를 더해야 홈 인디케이터가 있는 기기에서 마지막 행이 안 잘린다. */}
      <BottomSheetContent
        handle
        srTitle="공유하기"
        className="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
      >
        {header(Drawer.Close)}
        {body}
      </BottomSheetContent>
    </Drawer.Root>
  );
}
