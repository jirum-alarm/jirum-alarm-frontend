'use client';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { ANDROID_STORE_LINK, IOS_STORE_LINK } from '@/shared/config/appStore';
import { useDevice } from '@/shared/hooks/useDevice';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import {
  pushChannelSheetAtom,
  PushStatus,
  readPushStatus,
} from '@/shared/lib/push-channel/pushChannel';
import AlertDialog from '@/shared/ui/common/AlertDialog';

import { resolveAppDownloadPlatform } from '../model/resolvePlatform';

import AppDownloadQr from './AppDownloadQr';

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
 * 앱을 먼저 권한다: 앱 가입자의 키워드 등록률 25% vs 웹 15%, 푸시 받은 유저의 7일 뒤 재접속
 * 64% vs 못 받은 유저 31%(2026-10-05). 계정·키워드는 서버에 있으므로 같은 카카오·네이버로
 * 로그인만 하면 앱에서 그대로 받는다 — 그 사실을 문구로 알려준다(웹엔 Apple 로그인이 없어
 * 앱에서 Apple 로 들어가면 다른 계정이 된다).
 */
export default function PushChannelSheet() {
  const [sheet, setSheet] = useAtom(pushChannelSheetAtom);
  const { device } = useDevice();
  const { requestPermission } = useFcmPermission();
  const [status, setStatus] = useState<PushStatus>('default');

  const platform = resolveAppDownloadPlatform(device);

  useEffect(() => {
    if (!sheet) return;
    const current = readPushStatus();
    setStatus(current);
    pushEvent('push_channel_sheet_view', { platform, push_status: current });
  }, [sheet, platform]);

  if (!sheet) return null;

  const close = () => setSheet(null);
  const track = (choice: 'app' | 'browser' | 'dismiss') =>
    pushEvent('push_channel_click', { choice, platform, push_status: status });

  const handleBrowser = async () => {
    track('browser');
    await requestPermission({ force: true });
    close();
  };

  const subject = sheet.label ? `‘${sheet.label}’ 알림,` : '이 알림,';
  const storeLink = platform === 'apple' ? IOS_STORE_LINK : ANDROID_STORE_LINK;

  return (
    <AlertDialog defaultOpen onOpenChange={(open) => !open && close()}>
      <AlertDialog.Content className="max-w-[320px] gap-0">
        <AlertDialog.Header>
          <AlertDialog.Title className="text-xl font-semibold text-gray-900">
            {subject}
            <br />
            어디로 받을까요?
          </AlertDialog.Title>
          <AlertDialog.Description className="pt-2 text-sm text-gray-500">
            지금은 이 브라우저로 알림이 오지 않아요.
          </AlertDialog.Description>
        </AlertDialog.Header>

        <div className="mt-5 flex flex-col gap-y-2">
          {platform === 'non-mobile' ? (
            <AppDownloadQr compact />
          ) : (
            <AlertDialog.Action asChild onClick={() => track('app')}>
              <a
                href={storeLink}
                className="bg-primary-500 flex h-12 w-full items-center justify-center rounded-lg font-semibold text-gray-900"
              >
                앱으로 받기
              </a>
            </AlertDialog.Action>
          )}
          <p className="text-center text-xs text-gray-500">
            앱에서 카카오·네이버로 로그인하면
            <br />
            등록한 키워드가 그대로 있어요
          </p>

          {status === 'default' && (
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
              className="h-10 text-sm text-gray-500"
            >
              다음에 할게요
            </button>
          </AlertDialog.Cancel>
        </div>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
