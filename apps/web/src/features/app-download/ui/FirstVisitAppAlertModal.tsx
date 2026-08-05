'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { ANDROID_STORE_LINK, IOS_STORE_LINK } from '@/shared/config/appStore';
import AlertDialog from '@/shared/ui/common/AlertDialog';
import { Apple, Google } from '@/shared/ui/common/icons';

import { resolveAppDownloadPlatform } from '../model/resolvePlatform';

import AppDownloadQr from './AppDownloadQr';

// ponytail: 전역 1회 노출. 상품별로 반복 노출하면 이탈만 키움. 재노출 원하면 이 키 삭제 or 만료 추가.
const SEEN_KEY = 'jirum:app-alert-hook-seen';
// AlarmContainer 의 AppDownloadGuide 와 동일 에셋.
const APP_GUIDE_IMAGE = 'https://cdn.jirum-alarm.com/assets/app_download_guide.webp';

// dataLayer(GTM) push — 프로젝트 전 이벤트가 이 경로. 노출/클릭 CTR 측정용.
function pushEvent(event: string, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    source: 'first_visit_detail',
    ...props,
  });
}

/**
 * 상품 상세에 "처음" 진입한 유저를 앱 설치로 유도하는 가운데 모달.
 * - 데이터 근거: 상세 본 유저 재방문율 모바일 7% / PC 4.8%, 재방문 훅(앱DL·키워드) 사망 수준.
 * - 카피/이미지/스토어버튼은 알림탭 AppDownloadGuide 와 동일.
 * - 애플 → App Store, 안드 → Google Play, PC(비모바일) → 둘 다 노출.
 * - 앱내웹뷰(isJirumAlarmApp)는 유도 대상 아님 → 미노출.
 */
export default function FirstVisitAppAlertModal({ device }: { device: CheckDeviceResult }) {
  // 알림탭 AppDownloadGuide 와 동일한 platform 판정.
  const platform = device?.isJirumAlarmApp ? null : resolveAppDownloadPlatform(device);

  // 트리거 없이 첫 진입 시 자동 오픈.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!platform) return;
    if (localStorage.getItem(SEEN_KEY)) return; // 이미 봄
    localStorage.setItem(SEEN_KEY, '1');
    setShow(true);
    pushEvent('app_alert_hook_view', { platform });
  }, [platform]);

  if (!show || !platform) return null;

  return (
    <AlertDialog defaultOpen>
      <AlertDialog.Content className="max-w-[320px] gap-0">
        <AlertDialog.Header>
          <AlertDialog.Title className="text-2xl font-semibold text-gray-900">
            <span className="shadow-primary-500 inline-block font-extrabold shadow-[inset_0-12px_0]">
              지름알림
            </span>{' '}
            앱 다운받고
            <br /> 핫딜을 알림
            <span className="bg-primary-500 inline-flex h-2 w-2 rounded-full align-text-top"></span>{' '}
            으로 받아보세요!
          </AlertDialog.Title>
          <AlertDialog.Description>
            {/* 원본 에셋은 600x301(2:1). 280x334로 선언하면 확대·잘려서 폰 목업을 알아볼 수 없다. */}
            <div className="animate-fade-in mt-4 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={APP_GUIDE_IMAGE}
                alt="지름알림 앱 다운로드 안내"
                width={600}
                height={301}
                sizes="280px"
                className="h-auto w-full"
                quality={85}
              />
            </div>
          </AlertDialog.Description>
        </AlertDialog.Header>
        <div className="mt-4 flex flex-col items-center">
          {/* PC는 QR 카드가 "스캔 → 알림"을 다 말하므로 리드문을 두면 같은 말이 두 번 나온다. */}
          {platform !== 'non-mobile' && (
            <p className="pb-3 text-center text-sm text-gray-400">
              키워드를 등록하고
              <br />
              누구보다 빠르게 받아보세요
            </p>
          )}
          <div className="flex w-full gap-x-2">
            {platform === 'non-mobile' ? (
              <AppDownloadQr compact />
            ) : (
              <>
                {platform === 'android' && <StoreButton kind="android" />}
                {platform === 'apple' && <StoreButton kind="apple" />}
              </>
            )}
          </div>
          <AlertDialog.Cancel asChild>
            <button type="button" className="mt-3 h-10 text-sm text-gray-500">
              다음에 할게요
            </button>
          </AlertDialog.Cancel>
        </div>
      </AlertDialog.Content>
    </AlertDialog>
  );
}

function StoreButton({ kind }: { kind: 'android' | 'apple' }) {
  const link = kind === 'android' ? ANDROID_STORE_LINK : IOS_STORE_LINK;
  return (
    <AlertDialog.Action
      asChild
      onClick={() => pushEvent('app_download_click', { platform: kind, link })}
    >
      <a href={link} className="w-full">
        <motion.span
          className="bg-primary-500 flex w-full items-center justify-center gap-x-2 rounded-lg py-3 font-semibold text-gray-900"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          {kind === 'android' ? <Google /> : <Apple />}
          {kind === 'android' ? 'Google Play' : 'App Store'}
        </motion.span>
      </a>
    </AlertDialog.Action>
  );
}
