'use client';

import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { ProductService } from '@/shared/api/product';
import { PAGE } from '@/shared/config/page';
import { isAndroidUA, isInAppBrowserUA } from '@/shared/config/user-agent';
import useAlertSession from '@/shared/hooks/useAlertSession';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { getGraphqlErrorMessage } from '@/shared/lib/graphql-error';
import { shouldUseKakaoBridge } from '@/shared/lib/kakao-bridge-ua';
import {
  hasJoinedOkachat,
  markOkachatJoined,
  OKACHAT_LINK,
  openOkachatDirect,
  pushOkachatEvent,
  shouldShowOkachatSoftPrompt,
} from '@/shared/lib/okachat';
import { browserHandoffUrl, canHandoffToBrowser } from '@/shared/lib/push-channel/browserHandoff';
import { readPushStatus, usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import AlertDialog from '@/shared/ui/common/AlertDialog';
import { BottomSheetContent } from '@/shared/ui/common/BottomSheet';
import { useToast } from '@/shared/ui/common/Toast';

import FirstVisitAppAlertModal, {
  FIRST_VISIT_SEEN_KEY,
} from '@/features/app-download/ui/FirstVisitAppAlertModal';
import OpenInAppLink from '@/features/app-download/ui/OpenInAppLink';
import { useUpdateKeyword } from '@/features/mypage/model/update-keyword';
import { deriveKeyword } from '@/features/product-detail/lib/deriveKeyword';
import {
  isFirstVisitHoldout,
  waitForDeviceId,
} from '@/features/product-detail/lib/first-visit-holdout';
import {
  type BeautyRoomAssignment,
  resolveBeautyRoom,
} from '@/features/product-detail/lib/useBeautyRoomAssignment';

/**
 * 웹 푸시를 못 받는 첫 방문자 A/B(2026-10-09~): control = 앱 설치 시트(안드로이드 인앱 비회원은 브라우저 넘기기),
 * okachat = 카톡방 시트. 근거: 웹 푸시는 발송당 클릭 ~1.5%로 앱(~14%)의 1/10, 앱 설치 시트 클릭 0.4% vs
 * 상단 카톡방 배너 ~1%, 카톡방 유입 D14 14%(채널 중 최고). 기기마다 한 번 정해 고정한다.
 * 판정: okachat_prompt_click(placement=first_visit)/view vs app_download_click·handoff 클릭/노출.
 */
const FIRST_VISIT_AB_KEY = 'jirum:fv-ab-okachat';
const FIRST_VISIT_HOLDOUT_RECORDED_KEY = 'jirum:fv-holdout-recorded';

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
type SheetMode = 'none' | 'keyword' | 'handoff' | 'okachat' | 'app' | 'kakao_app';

export default function FirstVisitAlertSheet({
  device,
  title,
  productId,
  categoryId,
}: {
  device: CheckDeviceResult;
  title?: string;
  /** 상품 id — 첫 방문 배정 기록용(product.id 는 문자열로 온다) */
  productId?: string | number;
  /** 화장품(3)이면 뷰티방 실험 beauty_detail_room_v1 — b 군의 카톡방 시트는 뷰티방을 권한다. */
  categoryId?: number | null;
}) {
  const [mode, setMode] = useState<SheetMode>('none');
  const [beautyRoom, setBeautyRoom] = useState<BeautyRoomAssignment | null>(null);
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
    let cancelled = false;
    // 시트 숨김 실험(first_visit_sheet_holdout_v1) — 어느 군이든 배정을 서버에 남긴다(분석: 같은 기기 구매 클릭).
    const recordArm = (arm: string) => {
      const id = Number(productId);
      if (!id) return;
      void ProductService.collectPriceContextImpression({
        productId: id,
        source: device.isMobile ? 'detail_mobile' : 'detail_desktop',
        detail: `first_visit:${arm}`,
      }).catch(() => {});
    };
    const show = (next: Exclude<SheetMode, 'none'>) => {
      recordArm(next);
      setMode(next);
    };
    void waitForDeviceId().then((deviceId) => {
      if (cancelled) return;
      if (deviceId && isFirstVisitHoldout(deviceId)) {
        // 숨김 군은 SEEN 을 안 남겨 상세마다 여기로 온다 — 배정 기록은 기기당 한 번.
        try {
          if (localStorage.getItem(FIRST_VISIT_HOLDOUT_RECORDED_KEY)) return;
          localStorage.setItem(FIRST_VISIT_HOLDOUT_RECORDED_KEY, '1');
        } catch {
          return;
        }
        recordArm('holdout');
        return;
      }
      decide(resolveBeautyRoom(deviceId, categoryId));
    });
    return () => {
      cancelled = true;
    };

    function decide(beauty: BeautyRoomAssignment | null) {
      const status = readPushStatus();
      const canPush = status === 'default' || status === 'ok';
      const hasKeyword = [...new Intl.Segmenter().segment(keyword)].length >= 2;
      // 뷰티방 실험 b 군은 뷰티방 입장 기록으로 거른다(대조·비화장품은 핫딜방 그대로).
      const room = beauty?.arm === 'b' ? 'beauty' : 'hotdeal';
      // 웹 푸시를 못 받는 사람(이미 카톡방에 있는 사람 제외)은 절반에게 카톡방 시트.
      if (
        !(canPush && hasKeyword) &&
        shouldShowOkachatSoftPrompt({ joined: hasJoinedOkachat(room) })
      ) {
        if (pickFirstVisitVariant() === 'okachat') {
          localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
          setBeautyRoom(beauty);
          show('okachat');
          pushOkachatEvent('okachat_prompt_view', 'first_visit', room, beauty?.exp);
          return;
        }
      }
      const ua = navigator.userAgent;
      // 카톡 인앱 — 크롬 넘기기(웹 푸시, 앱의 1/10 열기율)·앱 설치 시트 대신 「키워드 걸고 → 앱에서 받기」 두 탭(shared/lib/kakao-bridge.ts).
      if (hasKeyword && shouldUseKakaoBridge(ua)) {
        localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
        show('kakao_app');
        pushEvent('keyword_prompt_view', { keyword, push_status: 'kakao_bridge' });
        return;
      }
      const handoff =
        !isLoggedIn &&
        canHandoffToBrowser({
          isAndroid: isAndroidUA(ua),
          isInAppBrowser: isInAppBrowserUA(ua),
          hasNotificationApi: 'Notification' in window,
        });
      if (hasKeyword && handoff) {
        localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
        show('handoff');
        pushEvent('keyword_prompt_view', { keyword, push_status: 'handoff' });
        return;
      }
      if (!canPush || !hasKeyword) {
        show('app'); // 앱 설치 시트가 스스로 SEEN 을 남긴다.
        return;
      }
      localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
      show('keyword');
      pushEvent('keyword_prompt_view', { keyword, push_status: status });
    }
  }, [device.isJirumAlarmApp, device.isMobile, keyword, isLoggedIn, productId, categoryId]);

  if (mode === 'app') return <FirstVisitAppAlertModal device={device} />;
  if (mode === 'okachat') {
    return (
      <OkachatSheet
        isMobile={device.isMobile}
        beautyRoom={beautyRoom}
        onClose={() => setMode('none')}
      />
    );
  }
  if (mode === 'none') return null;

  return (
    <KeywordAlertSheet
      keyword={keyword}
      isMobile={device.isMobile}
      handoff={mode === 'handoff'}
      appBridge={mode === 'kakao_app'}
      platform={isAndroidUA(navigator.userAgent) ? 'android' : 'apple'}
      onClose={() => setMode('none')}
    />
  );
}

function KeywordAlertSheet({
  keyword,
  isMobile,
  handoff,
  appBridge,
  platform,
  onClose,
}: {
  keyword: string;
  isMobile: boolean;
  /** 인앱 → 기본 브라우저로 넘겨 거기서 알림을 켠다. */
  handoff: boolean;
  /** 카톡 인앱 → 키워드를 건 뒤 「앱에서 받기」(실제 <a>)로 앱을 연다. 두 번째 탭이어야 intent·유니버설 링크가 열린다. */
  appBridge: boolean;
  platform: 'android' | 'apple';
  onClose: () => void;
}) {
  const { toast } = useToast();
  const router = useMyRouter();
  const { ensureAlertSession } = useAlertSession();
  const { requestPermission } = useFcmPermission();
  const promptPushChannel = usePushChannelPrompt();
  const [pending, setPending] = useState(false);
  const [bridgeRegistered, setBridgeRegistered] = useState(false);
  const { mutateAsync: addKeyword } = useUpdateKeyword({
    source: appBridge ? 'kakao_bridge' : 'first_visit',
    onError: (error) => {
      toast.error(getGraphqlErrorMessage(error) || '키워드 저장에 실패했습니다.');
    },
  });

  const handleAlert = async () => {
    if (pending) return;
    setPending(true);
    pushEvent('keyword_prompt_click', {
      keyword,
      push_status: handoff ? 'handoff' : appBridge ? 'kakao_bridge' : undefined,
    });
    if (appBridge) {
      // 시트를 닫지 않고 「앱에서 받기」 버튼으로 바꾼다 — 등록(비동기) 뒤 자동 이동은 웹뷰가 막을 수 있다.
      try {
        if (!(await ensureAlertSession())) return;
        await addKeyword({ keyword });
        setBridgeRegistered(true);
      } catch (error) {
        // '이미 등록된 키워드'는 목적이 달성된 상태 — 앱으로 잇는다. 나머지 실패 토스트는 onError 가 띄운다.
        if (getGraphqlErrorMessage(error).includes('이미 등록된')) setBridgeRegistered(true);
      } finally {
        setPending(false);
      }
      return;
    }
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
    let registered = false;
    try {
      if (!(await ensureAlertSession())) return;
      await addKeyword({ keyword });
      registered = true;
      toast.success(`'${keyword}' 알림을 등록했어요.`, {
        action: { label: '보기', onClick: () => router.push(PAGE.MYPAGE_KEYWORD) },
      });
      await permission;
    } catch {
      // 실패 토스트는 onError 가 띄운다.
    } finally {
      setPending(false);
      onClose();
    }
    // 키워드는 등록됐는데 권한을 못 얻었으면(거절·창을 그냥 닫음·크롬 조용한 권한 요청) 받을 통로가 없다.
    // 다른 등록 지점처럼 "어디로 받을까요"(앱 / 이 브라우저 다시)로 잇는다.
    // 2026-10-12 실측: 게스트 키워드 등록의 88% 가 이 시트인데 10/12 등록 게스트 29명 중 토큰 11명, 그 시트 노출 4명.
    if (registered) promptPushChannel(keyword);
  };

  const heading = bridgeRegistered ? (
    <>
      등록했어요,
      <br />
      앱에서 받기만 남았어요
    </>
  ) : (
    <>
      이 상품, 또 싸게 뜨면
      <br />
      바로 알려드릴까요?
    </>
  );
  const bodyText = bridgeRegistered ? (
    <>
      앱을 열면 ‘{keyword}’ 핫딜 알림이 와요.
      <br />
      카톡 안에서는 알림을 보낼 수 없어서 앱으로 받아요.
    </>
  ) : appBridge ? (
    <>
      카톡방은 모두의 딜, 앱은 ‘{keyword}’ 딜만.
      <br />새 딜이 뜨면 폰 알림으로 먼저 알려드려요.
    </>
  ) : handoff ? (
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
  const actions = bridgeRegistered ? (
    <div className="mt-5 flex flex-col gap-y-2">
      <OpenInAppLink
        platform={platform}
        path={window.location.pathname}
        source="kakao_bridge"
        iosUniversalLink
        // 바로 닫으면 <a> 가 DOM 에서 빠져 이동이 취소된다(연결 안 된 앵커는 이동하지 않는다) — 한 박자 뒤에.
        onClick={() => window.setTimeout(onClose, 500)}
        className="bg-primary-500 text-fixed-900 flex h-12 w-full items-center justify-center rounded-lg font-semibold"
      >
        앱에서 알림 받기
      </OpenInAppLink>
      <button type="button" onClick={onClose} className="h-10 text-sm text-gray-500">
        다음에 할게요
      </button>
    </div>
  ) : (
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
      <BottomSheetContent handle className="pb-safe-bottom-16 px-5">
        <Drawer.Title className="text-2xl font-semibold text-gray-900">{heading}</Drawer.Title>
        <Drawer.Description className="pt-2 text-sm text-gray-500">{bodyText}</Drawer.Description>
        {actions}
      </BottomSheetContent>
    </Drawer.Root>
  );
}

function OkachatSheet({
  isMobile,
  beautyRoom,
  onClose,
}: {
  isMobile: boolean;
  /** 뷰티방 실험 배정(화장품 상세만). b 군이면 뷰티방을 권한다. */
  beautyRoom: BeautyRoomAssignment | null;
  onClose: () => void;
}) {
  const beauty = beautyRoom?.arm === 'b';
  const room = beauty ? 'beauty' : 'hotdeal';
  const link = beauty ? beautyRoom.beautyLink : OKACHAT_LINK;
  const exp = beautyRoom?.exp;
  const heading = beauty ? (
    <>
      뷰티 핫딜만,
      <br />
      카톡방에서 받아보세요
    </>
  ) : (
    <>
      핫딜, 카톡방에서
      <br />
      바로 받아보세요
    </>
  );
  const bodyText = beauty ? (
    <>
      앱 설치 없이 카카오톡 오픈채팅방으로
      <br />
      화장품·스킨케어 핫딜만 모아 보내드려요.
    </>
  ) : (
    <>
      앱 설치 없이 카카오톡 오픈채팅방으로
      <br />
      지금 뜨는 핫딜을 실시간으로 보내드려요.
    </>
  );
  const actions = (
    <div className="mt-5 flex flex-col gap-y-2">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          markOkachatJoined(room);
          pushOkachatEvent('okachat_prompt_click', 'first_visit', room, exp);
          if (openOkachatDirect('first_visit', { room, link, exp })) e.preventDefault();
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
      <BottomSheetContent handle className="pb-safe-bottom-16 px-5">
        <Drawer.Title className="text-2xl font-semibold text-gray-900">{heading}</Drawer.Title>
        <Drawer.Description className="pt-2 text-sm text-gray-500">{bodyText}</Drawer.Description>
        {actions}
      </BottomSheetContent>
    </Drawer.Root>
  );
}
