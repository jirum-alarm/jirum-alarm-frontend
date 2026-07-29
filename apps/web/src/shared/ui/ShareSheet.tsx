'use client';

import { Dialog } from 'radix-ui';
import { useState } from 'react';
import { Drawer } from 'vaul';

import useScreen from '@/shared/hooks/useScreenSize';
import { ensureKakao } from '@/shared/lib/kakao';
import {
  buildCaption,
  buildIntentUrl,
  buildShareMessage,
  buildShareUrl,
  type ShareChannel,
} from '@/shared/lib/share';
import { triggerHaptic } from '@/shared/lib/webview';
import { ShareLink, ShareThreads, ShareX } from '@/shared/ui/common/icons';
import SvgKakao from '@/shared/ui/common/icons/login/Kakao';
import { useToast } from '@/shared/ui/common/Toast';

// 공유 시트. 채널 순서 = 국내 사용 빈도(카톡 1순위). "기타"는 OS 시트 폴백이라
// navigator.share 가 없는 환경(데스크톱 대부분)에서는 렌더하지 않는다.
type Props = {
  children: React.ReactNode;
  title: string;
  description?: string;
  imageUrl?: string;
};

// dataLayer(GTM) push — DealsTracking 패턴.
// ★GTM 컨테이너에 share_channel_click 을 등록해야 Mixpanel 에 도달한다(배선만으론 미도달).
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

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(buildShareMessage(title, url, description));
      toast(<>링크가 클립보드에 복사되었어요!</>);
    } catch {
      toast(<>복사에 실패했어요. 주소창의 링크를 직접 복사해주세요.</>);
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
      } else if (channel === 'x' || channel === 'threads') {
        const opened = window.open(buildIntentUrl(channel, caption, url), '_blank', 'noopener');
        // 팝업 차단 시 공유가 조용히 죽지 않게 복사로 폴백.
        if (!opened) await copyLink(url);
      } else {
        await copyLink(url);
      }
      setOpen(false);
    } catch (e) {
      // 사용자가 시트를 닫은 것(AbortError)은 실패가 아니다.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      if (channel === 'kakao') {
        toast(<>카카오톡 공유를 열지 못했어요. 링크 복사를 이용해주세요.</>);
        return;
      }
      await copyLink(url);
    } finally {
      // catch 안에 early return 이 있어 finally 로 풀어야 잠금이 안 남는다.
      setPending(null);
    }
  };

  // 브랜드 배경색 원형 + 흰 로고. X·Threads 공식 배경은 검정, 링크 복사는 브랜드가 아니라 회색.
  const channels: { c: ShareChannel; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      c: 'x',
      label: 'X',
      icon: <ShareX width={20} height={20} className="text-white" />,
      badge: 'bg-black',
    },
    {
      c: 'threads',
      label: '스레드',
      icon: <ShareThreads width={22} height={22} className="text-white" />,
      badge: 'bg-black',
    },
    {
      c: 'copy',
      label: '링크 복사',
      icon: <ShareLink width={20} height={20} className="text-gray-600" />,
      badge: 'bg-gray-100',
    },
  ];

  // 무엇을 공유하는지 보여주는 프리뷰. 링크만 있으면 뭘 보내는지 알 수 없다.
  const preview = (
    <div className="mb-3 flex items-center gap-2.5 rounded-[11px] border border-gray-200 bg-gray-50 p-2.5">
      {imageUrl ? (
        // 외부 CDN 썸네일이라 next/image 대신 img — 도메인 화이트리스트 없이 뜨게.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="size-11 flex-none rounded-[7px] object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div className="min-w-0">
        <div className="line-clamp-2 text-xs font-semibold break-all">{title}</div>
        {description ? <div className="mt-0.5 text-xs font-bold">{description}</div> : null}
      </div>
    </div>
  );

  // 시트/모달이 공유하는 본문. 두 껍데기 모두 같은 위계(카톡 풀너비 → 나머지 균등).
  const body = (
    <>
      {preview}
      {/* 카카오 브랜드 색은 로그인 버튼과 동일 값 사용(앱 내 일관성) — login/page.tsx 관용구 */}
      <button
        type="button"
        onClick={() => share('kakao')}
        disabled={!!pending}
        className="flex h-[46px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#FBE84C] text-sm font-bold text-gray-900 hover:bg-[#F5DC3D] disabled:opacity-60"
      >
        <SvgKakao width={20} height={20} />
        {pending === 'kakao' ? '카카오톡 여는 중…' : '카카오톡으로 공유'}
      </button>
      <div className="mt-2 flex gap-2">
        {channels.map(({ c, label, icon, badge }) => (
          <button
            key={c}
            type="button"
            onClick={() => share(c)}
            disabled={!!pending}
            aria-label={`${label}(으)로 공유`}
            className="group flex flex-1 flex-col items-center gap-1.5 rounded-[10px] py-1 disabled:opacity-60"
          >
            <span
              className={`flex size-11 items-center justify-center rounded-full transition-transform group-active:scale-95 ${badge}`}
            >
              {icon}
            </span>
            <span className="text-[11px] font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </>
  );

  // PC 는 센터 모달, 모바일은 바텀시트 — 손이 닿는 위치가 달라 껍데기를 나눈다.
  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/30" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[9999] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl outline-hidden">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title asChild>
                <h3 className="text-base font-bold">공유하기</h3>
              </Dialog.Title>
              <Dialog.Close
                aria-label="닫기"
                className="-m-2 flex size-9 items-center justify-center rounded-full p-2 text-lg leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </Dialog.Close>
            </div>
            {body}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        {/* pb 에 safe-area 를 더해야 홈 인디케이터가 있는 기기에서 마지막 행이 안 잘린다. */}
        <Drawer.Content className="max-w-mobile-max rounded-t-5 fixed inset-x-0 bottom-0 z-[9999] mx-auto h-fit w-full bg-white pb-[calc(env(safe-area-inset-bottom)+20px)] outline-hidden">
          <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-gray-200" />
          <Drawer.Title asChild>
            <h3 className="px-5 pt-4 pb-3 text-base font-bold">공유하기</h3>
          </Drawer.Title>

          <div className="px-5">{body}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
