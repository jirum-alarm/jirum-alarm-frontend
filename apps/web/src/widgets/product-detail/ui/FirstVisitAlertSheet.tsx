'use client';

import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import useAlertSession from '@/shared/hooks/useAlertSession';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { readPushStatus } from '@/shared/lib/push-channel/pushChannel';
import AlertDialog from '@/shared/ui/common/AlertDialog';
import { useToast } from '@/shared/ui/common/Toast';

import FirstVisitAppAlertModal, {
  FIRST_VISIT_SEEN_KEY,
} from '@/features/app-download/ui/FirstVisitAppAlertModal';
import { useUpdateKeyword } from '@/features/mypage/model/update-keyword';
import { deriveKeyword } from '@/features/product-detail/lib/deriveKeyword';

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
  const [mode, setMode] = useState<'none' | 'keyword' | 'app'>('none');
  const keyword = deriveKeyword(title ?? '');

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
    if (!canPush || !hasKeyword) {
      setMode('app'); // 앱 설치 시트가 스스로 SEEN 을 남긴다.
      return;
    }
    localStorage.setItem(FIRST_VISIT_SEEN_KEY, '1');
    setMode('keyword');
    pushEvent('keyword_prompt_view', { keyword, push_status: status });
  }, [device.isJirumAlarmApp, keyword]);

  if (mode === 'app') return <FirstVisitAppAlertModal device={device} />;
  if (mode !== 'keyword') return null;

  return (
    <KeywordAlertSheet
      keyword={keyword}
      isMobile={device.isMobile}
      onClose={() => setMode('none')}
    />
  );
}

function KeywordAlertSheet({
  keyword,
  isMobile,
  onClose,
}: {
  keyword: string;
  isMobile: boolean;
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
    pushEvent('keyword_prompt_click', { keyword });
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
  const bodyText = (
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
        알림 받기
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
