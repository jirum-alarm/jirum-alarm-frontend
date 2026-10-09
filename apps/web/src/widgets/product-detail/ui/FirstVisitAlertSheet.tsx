'use client';

import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { isAndroidUA, isInAppBrowserUA } from '@/shared/config/user-agent';
import useAlertSession from '@/shared/hooks/useAlertSession';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { browserHandoffUrl, canHandoffToBrowser } from '@/shared/lib/push-channel/browserHandoff';
import { readPushStatus } from '@/shared/lib/push-channel/pushChannel';
import AlertDialog from '@/shared/ui/common/AlertDialog';
import { useToast } from '@/shared/ui/common/Toast';

import FirstVisitAppAlertModal, {
  FIRST_VISIT_SEEN_KEY,
} from '@/features/app-download/ui/FirstVisitAppAlertModal';
import { useUpdateKeyword } from '@/features/mypage/model/update-keyword';
import { deriveKeyword } from '@/features/product-detail/lib/deriveKeyword';
import {
  markOkachatJoined,
  OKACHAT_LINK,
  pushOkachatEvent,
  shouldShowOkachatSoftPrompt,
} from '@/features/product-detail/lib/okachat';

/**
 * 웹 푸시를 못 받는 첫 방문자 A/B(2026-10-09~): control = 앱 설치 시트(안드로이드 인앱 비회원은 브라우저 넘기기),
 * okachat = 카톡방 시트. 근거: 웹 푸시는 발송당 클릭 ~1.5%로 앱(~14%)의 1/10, 앱 설치 시트 클릭 0.4% vs
 * 상단 카톡방 배너 ~1%, 카톡방 유입 D14 14%(채널 중 최고). 기기마다 한 번 정해 고정한다.
 * 판정: okachat_prompt_click(placement=first_visit)/view vs app_download_click·handoff 클릭/노출.
 */
const FIRST_VISIT_AB_KEY = 'jirum:fv-ab-okachat';

function pickFirstVisitVariant(): 'okachat' | 'control' {
  try {
    const saved = localStorage.getItem(FIRST_VISIT_AB_KEY);
    if (saved === 'okachat' || saved === 'control') return saved;
    const picked = Math.random() < 0.5 ? 'okachat' : 'control';
    localStorage.setItem(FIRST_VISIT_AB_KEY, picked);
    return picked;
  } catch {
    return 'control';
  }
}

function pushEvent(event: string, props: Record<string, unknown>) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement: 'first_visit',
    ...props,
  });
}

/**
 * 상품 상세 첫 방문 시트. 웹 푸시를 받을 수 있는 브라우저면 「이 상품 또 싸게 뜨면 알려드릴까요?」 —
 * 한 번 탭에 권한 요청 + 게스트 키워드 등록. 못 받는 브라우저(네이버 앱 인앱·iOS 사파리)는 예전 앱 설치 시트.
 *
 * 왜: 앱 설치 시트는 28일 2.5만 명이 보고 109명(0.4%)이 눌렀다(2026-10-09). 상세는 검색 유입의 착지점이고,
 * 북극성(알림 경유 재방문)의 다리는 「여기서 알림 등록 → 첫 알림」이다. 로그인 없이 등록되는 게스트 계정이
 * 생겨서(crawling-server 7d6cbd71) 시트에서 바로 끝낼 수 있다. 웹 푸시 가능 브라우저는 상세 방문자의 ~40%.
 *
 * 안드로이드 인앱(네이버 앱 31%)은 웹 푸시가 없지만 같은 폰의 기본 브라우저는 된다 → 비회원이면 여기서 게스트
 * 키워드를 등록하고 기본 브라우저로 넘긴다(handoff, 도착은 BrowserHandoffArrival). 회원은 넘기면 세션이 안 따라가 앱 시트.
 *
 * 계측은 GTM 에 태그가 있는 keyword_prompt_view/click 을 재사용한다(placement=first_visit) — 새 이벤트명은 GTM
 * 태그 없이는 GA4 에 안 들어간다. 등록 자체는 keyword_register(source=first_visit).
 */
export default function FirstVisitAlertSheet({
  device,
  title,
}: {
  device: CheckDeviceResult;
  title?: string;
}) {
  const [mode, setMode] = useState<'none' | 'keyword' | 'handoff' | 'okachat' | 'app'>('none');
  const keyword = deriveKeyword(title ?? '');
  const { isLoggedIn } = useIsLoggedIn();

  useEffect(() => {
    if (device.isJirumAlarmApp) return;
    let seen: string | null;
    try {
      seen = localStorage.getItem(FIRST_VISIT_SEEN_KEY);
    } catch {
      return;
    }
    if (seen) return;
    const status = readPushStatus();
    const canPush = status === 'default' || status === 'ok';
    const hasKeyword = [...new Intl.Segmenter().segment(keyword)].length >= 2;
    // 웹 푸시를 못 받는 사람(이미 카톡방에 있는 사람 제외)은 절반에게 카톡방 시트.
    if (!(canPush && hasKeyword) && shouldShowOkachatSoftPrompt()) {
      if (pickFirstVisitVariant() === 'okachat') {
        localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
        setMode('okachat');
        pushOkachatEvent('okachat_prompt_view', 'first_visit');
        return;
      }
    }
    const ua = navigator.userAgent;
    const handoff =
      !isLoggedIn &&
      canHandoffToBrowser({
        isAndroid: isAndroidUA(ua),
        isInAppBrowser: isInAppBrowserUA(ua),
        hasNotificationApi: 'Notification' in window,
      });
    if (hasKeyword && handoff) {
      localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
      setMode('handoff');
      pushEvent('keyword_prompt_view', { keyword, push_status: 'handoff' });
      return;
    }
    if (!canPush || !hasKeyword) {
      setMode('app'); // 앱 설치 시트가 스스로 SEEN 을 남긴다.
      return;
    }
    localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
    setMode('keyword');
    pushEvent('keyword_prompt_view', { keyword, push_status: status });
  }, [device.isJirumAlarmApp, keyword, isLoggedIn]);

  if (mode === 'app') return <FirstVisitAppAlertModal device={device} />;
  if (mode === 'okachat') {
    return <OkachatSheet isMobile={device.isMobile} onClose={() => setMode('none')} />;
  }
  if (mode === 'none') return null;

  return (
    <KeywordAlertSheet
      keyword={keyword}
      isMobile={device.isMobile}
      handoff={mode === 'handoff'}
      onClose={() => setMode('none')}
    />
  );
}

function KeywordAlertSheet({
  keyword,
  isMobile,
  handoff,
  onClose,
}: {
  keyword: string;
  isMobile: boolean;
  /** 인앱 → 기본 브라우저로 넘겨 거기서 알림을 켠다. */
  handoff: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { ensureAlertSession } = useAlertSession();
  const { requestPermission } = useFcmPermission();
  const [pending, setPending] = useState(false);
  const { mutateAsync: addKeyword } = useUpdateKeyword({
    source: 'first_visit',
    onError: (error) => {
      const gql = error as { response?: { errors?: { message?: string }[] } };
      toast(gql?.response?.errors?.[0]?.message || '키워드 저장에 실패했습니다.');
    },
  });

  const handleAlert = async () => {
    if (pending) return;
    setPending(true);
    pushEvent('keyword_prompt_click', { keyword, push_status: handoff ? 'handoff' : undefined });
    if (handoff) {
      try {
        if (!(await ensureAlertSession())) return;
        await addKeyword({ keyword });
        const deviceId = localStorage.getItem('jirum-alarm-device-id');
        if (deviceId) window.location.href = browserHandoffUrl(window.location.href, deviceId);
      } catch {
        // 실패 토스트는 onError 가 띄운다.
      } finally {
        setPending(false);
        onClose();
      }
      return;
    }
    // 권한 요청은 탭 직후 바로 — 네트워크를 기다린 뒤에 부르면 브라우저가 "사용자 동작 없음"으로 막는다.
    // ponytail: 권한 수락이 게스트 세션보다 먼저 끝나면 토큰이 비회원으로 붙는다 — 다음 페이지 로드의
    //   FCMConfig 재등록이 게스트에 붙인다. 바로 붙여야 하면 수락 후 addPushToken 을 한 번 더.
    const permission =
      readPushStatus() === 'default' ? requestPermission({ force: true }) : Promise.resolve(null);
    try {
      if (!(await ensureAlertSession())) return;
      await addKeyword({ keyword });
      toast(`'${keyword}' 알림을 등록했어요.`);
      await permission;
    } catch {
      // 실패 토스트는 onError 가 띄운다.
    } finally {
      setPending(false);
      onClose();
    }
  };

  const heading = (
    <>
      이 상품, 또 싸게 뜨면
      <br />
      바로 알려드릴까요?
    </>
  );
  const bodyText = handoff ? (
    <>
      ‘{keyword}’ 핫딜이 올라오면 알림을 보내드려요.
      <br />
      알림은 크롬·삼성 인터넷 같은 브라우저에서 받을 수 있어서, 누르면 브라우저로 열려요.
    </>
  ) : (
    <>
      ‘{keyword}’ 핫딜이 올라오면 알림을 보내드려요.
      <br />
      로그인하지 않아도 돼요.
    </>
  );
  const actions = (
    <div className="mt-5 flex flex-col gap-y-2">
      <button
        type="button"
        onClick={handleAlert}
        disabled={pending}
        className="bg-primary-500 text-fixed-900 h-12 w-full rounded-lg font-semibold disabled:opacity-50"
      >
        {handoff ? '브라우저에서 알림 받기' : '알림 받기'}
      </button>
      <button type="button" onClick={onClose} className="h-10 text-sm text-gray-500">
        다음에 할게요
      </button>
    </div>
  );

  if (!isMobile) {
    return (
      <AlertDialog defaultOpen onOpenChange={(open) => !open && onClose()}>
        <AlertDialog.Content className="max-w-[320px] gap-0">
          <AlertDialog.Header>
            <AlertDialog.Title className="text-xl font-semibold text-gray-900">
              {heading}
            </AlertDialog.Title>
            <AlertDialog.Description className="pt-2 text-sm text-gray-500">
              {bodyText}
            </AlertDialog.Description>
          </AlertDialog.Header>
          {actions}
        </AlertDialog.Content>
      </AlertDialog>
    );
  }

  return (
    <Drawer.Root open onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="max-w-mobile-max rounded-t-sheet pb-safe-bottom-16 fixed inset-x-0 bottom-0 z-[9999] mx-auto h-fit w-full bg-white px-5 pt-3 outline-hidden">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" aria-hidden />
          <Drawer.Title className="text-2xl font-semibold text-gray-900">{heading}</Drawer.Title>
          <Drawer.Description className="pt-2 text-sm text-gray-500">{bodyText}</Drawer.Description>
          {actions}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function OkachatSheet({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  const heading = (
    <>
      핫딜, 카톡방에서
      <br />
      바로 받아보세요
    </>
  );
  const bodyText = (
    <>
      앱 설치 없이 카카오톡 오픈채팅방으로
      <br />
      지금 뜨는 핫딜을 실시간으로 보내드려요.
    </>
  );
  const actions = (
    <div className="mt-5 flex flex-col gap-y-2">
      <a
        href={OKACHAT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          markOkachatJoined();
          pushOkachatEvent('okachat_prompt_click', 'first_visit');
          onClose();
        }}
        className="bg-primary-500 text-fixed-900 flex h-12 w-full items-center justify-center rounded-lg font-semibold"
      >
        카톡방 입장하기
      </a>
      <button type="button" onClick={onClose} className="h-10 text-sm text-gray-500">
        다음에 할게요
      </button>
    </div>
  );

  if (!isMobile) {
    return (
      <AlertDialog defaultOpen onOpenChange={(open) => !open && onClose()}>
        <AlertDialog.Content className="max-w-[320px] gap-0">
          <AlertDialog.Header>
            <AlertDialog.Title className="text-xl font-semibold text-gray-900">
              {heading}
            </AlertDialog.Title>
            <AlertDialog.Description className="pt-2 text-sm text-gray-500">
              {bodyText}
            </AlertDialog.Description>
          </AlertDialog.Header>
          {actions}
        </AlertDialog.Content>
      </AlertDialog>
    );
  }

  return (
    <Drawer.Root open onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="max-w-mobile-max rounded-t-sheet pb-safe-bottom-16 fixed inset-x-0 bottom-0 z-[9999] mx-auto h-fit w-full bg-white px-5 pt-3 outline-hidden">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" aria-hidden />
          <Drawer.Title className="text-2xl font-semibold text-gray-900">{heading}</Drawer.Title>
          <Drawer.Description className="pt-2 text-sm text-gray-500">{bodyText}</Drawer.Description>
          {actions}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
