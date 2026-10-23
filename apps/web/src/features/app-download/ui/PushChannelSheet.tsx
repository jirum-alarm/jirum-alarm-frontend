'use client';

import { text } from '@jirum/design-system/recipes';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { useDevice } from '@/shared/hooks/useDevice';
import { isGuestAtom } from '@/shared/hooks/useIsLoggedIn';
import { resolveAppDownloadPlatform } from '@/shared/lib/app-handoff/resolvePlatform';
import { cn } from '@/shared/lib/cn';
import { isPermissionPending, useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import {
  pushChannelSheetAtom,
  PushStatus,
  readPushStatus,
} from '@/shared/lib/push-channel/pushChannel';
import AppDownloadQr from '@/shared/ui/app-handoff/AppDownloadQr';
import OpenInAppLink from '@/shared/ui/app-handoff/OpenInAppLink';
import AlertDialog from '@/shared/ui/common/AlertDialog';
import Button, { buttonClass } from '@/shared/ui/common/Button';

function pushEvent(event: string, props: Record<string, unknown>) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    ...props,
  });
}

/**
 * 알림을 등록했는데 이 브라우저로는 못 받을 때 "어디로 받을까요"를 묻는 시트.
 * AppProvider 에 한 번 달고, 등록 지점들은 usePushChannelPrompt 로 연다.
 *
 * 앱을 먼저 권한다: 앱 가입자가 웹보다 키워드를 더 많이 등록하고, 푸시 받은 유저의 7일 뒤 재접속이
 * 못 받은 유저보다 훨씬 높다. 계정·키워드는 서버에 있으므로 같은 카카오·네이버로
 * 로그인만 하면 앱에서 그대로 받는다 — 그 사실을 문구로 알려준다(웹엔 Apple 로그인이 없어
 * 앱에서 Apple 로 들어가면 다른 계정이 된다).
 */
export default function PushChannelSheet() {
  const [sheet, setSheet] = useAtom(pushChannelSheetAtom);
  const { device } = useDevice();
  const { requestPermission } = useFcmPermission();
  const [status, setStatus] = useState<PushStatus>('default');
  // 권한 요청이 창 없이 주소창 아이콘으로만 뜬 채(조용한 요청 — Edge 기본값) 답이 없다.
  // 2026-10-23 판독(obs_web_push_permission_timeout): Edge 키워드 등록자의 권한 결과 대부분이 이 상태였다.
  const [quietPending, setQuietPending] = useState(false);
  // 게스트(로그인 없이 등록)의 키워드는 이 기기에만 있다 — 앱으로 가면 로그인 전엔 안 보인다.
  // 그래서 게스트에겐 지금 바로 받는 이 브라우저 알림을 앞에 둔다.
  const isGuest = useAtomValue(isGuestAtom);
  const browserFirst = isGuest && status === 'default';

  const platform = resolveAppDownloadPlatform(device);

  useEffect(() => {
    if (!sheet) return;
    const current = readPushStatus();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 시트가 열릴 때마다 브라우저 알림 권한(외부 상태)을 다시 읽는다 — 권한은 React 밖에서 바뀐다.
    setStatus(current);
    setQuietPending(current === 'default' && isPermissionPending());
    pushEvent('push_channel_sheet_view', {
      platform,
      push_status: current,
      placement: sheet.placement,
    });
  }, [sheet, platform]);

  if (!sheet) return null;

  const close = () => setSheet(null);
  const track = (choice: 'app' | 'browser' | 'dismiss') =>
    pushEvent('push_channel_click', {
      choice,
      platform,
      push_status: status,
      placement: sheet.placement,
    });

  const handleBrowser = async () => {
    track('browser');
    await requestPermission({ force: true });
    close();
  };

  const subject = sheet.label ? `‘${sheet.label}’ 알림,` : '이 알림,';

  return (
    <AlertDialog defaultOpen onOpenChange={(open) => !open && close()}>
      <AlertDialog.Content className="max-w-[320px] gap-0">
        <AlertDialog.Header>
          <AlertDialog.Title className="text-xl font-semibold text-gray-900">
            {subject}
            <br />
            어디로 받을까요?
          </AlertDialog.Title>
          <AlertDialog.Description className={cn(text.muted, 'pt-2')}>
            지금은 이 브라우저로 알림이 오지 않아요.
            {quietPending && (
              <>
                <br />
                허용 창이 안 보였다면 주소창의 알림(종) 아이콘을 눌러 허용해 주세요.
              </>
            )}
          </AlertDialog.Description>
        </AlertDialog.Header>

        <div className="mt-5 flex flex-col gap-y-2">
          {browserFirst && (
            <Button onClick={handleBrowser} className="mb-3">
              {platform === 'non-mobile' ? '이 PC로 바로 받기' : '이 브라우저로 바로 받기'}
            </Button>
          )}
          {platform === 'non-mobile' ? (
            <AppDownloadQr compact />
          ) : (
            <AlertDialog.Action asChild onClick={() => track('app')}>
              <OpenInAppLink
                platform={platform}
                path="/"
                source="push_channel"
                className={cn(buttonClass(), 'flex items-center justify-center')}
              >
                앱으로 받기
              </OpenInAppLink>
            </AlertDialog.Action>
          )}
          <p className={cn(text.caption, 'text-center')}>
            {isGuest ? (
              <>
                여기서 로그인한 뒤 앱에서 같은 계정으로 들어가면
                <br />
                등록한 키워드가 그대로 있어요
              </>
            ) : (
              <>
                앱에서 카카오·네이버로 로그인하면
                <br />
                등록한 키워드가 그대로 있어요
              </>
            )}
          </p>

          {status === 'default' && !browserFirst && (
            <button
              type="button"
              onClick={handleBrowser}
              className="mt-2 h-12 w-full rounded-lg border border-gray-200 text-sm font-semibold text-gray-800"
            >
              {platform === 'non-mobile' ? '이 PC로 받기' : '이 브라우저로 받기'}
            </button>
          )}

          <AlertDialog.Cancel asChild>
            <button
              type="button"
              onClick={() => track('dismiss')}
              className={cn(text.muted, 'h-10')}
            >
              다음에 할게요
            </button>
          </AlertDialog.Cancel>
        </div>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
