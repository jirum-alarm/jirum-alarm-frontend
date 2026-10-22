'use client';

import { useAtomValue } from 'jotai';
import * as m from 'motion/react-m';
import Image from 'next/image';
import { type ReactNode, useEffect } from 'react';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useIsLoggedIn, { isGuestAtom } from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { resolveAppDownloadPlatform } from '@/shared/lib/app-handoff/resolvePlatform';
import { cn } from '@/shared/lib/cn';
import AppDownloadQr from '@/shared/ui/app-handoff/AppDownloadQr';
import OpenInAppLink from '@/shared/ui/app-handoff/OpenInAppLink';
import Button, { buttonClass } from '@/shared/ui/common/Button';
import { Apple, ArrowDown, Google, LoadingSpinner } from '@/shared/ui/common/icons';
import { Illust } from '@/shared/ui/common/icons/Illust';
import Link from '@/shared/ui/Link';

import AlarmList from './AlarmList';

const SIGNUP_PATH = '/signup';

/**
 * @param guestNotice 게스트 알림 목록 위에 둘 안내(이 브라우저로 푸시가 안 오면 「앱 설치·알림 켜기」 —
 *   페이지가 PushStatusBanner 를 넘긴다. 피처끼리 직접 import 하지 않으려고 슬롯으로 받는다).
 */
const AlarmContainer = ({ guestNotice }: { guestNotice?: ReactNode }) => {
  const { device, isHydrated } = useDevice();

  const { isLoggedIn, isLoading } = useIsLoggedIn();
  const isGuest = useAtomValue(isGuestAtom);

  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 게스트(로그인 없이 키워드를 건 브라우저)는 자기 알림을 본다. 예전엔 비회원과 같이 앱 설치 화면만 떠서
  // 웹 푸시를 누르고 들어와도 알림 목록이 없었다(2026-10-12) — 알림 경유 재방문이 이 화면을 지난다.
  if (!isLoggedIn && isGuest && !device.isJirumAlarmApp) {
    return (
      <>
        {guestNotice}
        <AlarmList />
      </>
    );
  }

  if (!isLoggedIn && !device.isJirumAlarmApp) {
    return <AppDownloadGuide platform={resolveAppDownloadPlatform(device)} />;
  }

  if (!isLoggedIn && device.isJirumAlarmApp) {
    return <LoginGuide />;
  }

  return <AlarmList />;
};

export default AlarmContainer;

function AppDownloadGuide({ platform }: { platform: 'apple' | 'android' | 'non-mobile' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="flex h-full flex-col px-5 pt-9 pb-8">
      <p
        className={
          platform === 'non-mobile' ? 'text-2xl font-semibold' : 'pb-7 text-2xl font-semibold'
        }
      >
        <span className="shadow-primary-500 shadow-highlight inline-block font-extrabold">
          지름알림
        </span>{' '}
        앱 다운받고
        <br /> 핫딜을 알림
        <span className="bg-primary-500 inline-flex h-2 w-2 rounded-full align-text-top"></span>{' '}
        으로 받아보세요!
      </p>
      {platform === 'non-mobile' && (
        // 하단 문구를 걷어냈으니 "왜 받아야 하는지"는 제목 바로 아래 한 줄로 남긴다.
        <p className="pt-2 pb-6 text-sm text-gray-500">
          키워드를 등록하고 누구보다 빠르게 핫딜을 받아보세요
        </p>
      )}
      {/* 원본 에셋은 600x301(2:1). 335x400으로 선언하면 이미지가 눌려서 폰 목업이 잘린다. */}
      <div className="animate-fade-in overflow-hidden rounded-md bg-gray-100">
        <Image
          src={`https://cdn.jirum-alarm.com/assets/app_download_guide.webp`}
          alt="download app guide"
          width={600}
          height={301}
          sizes="(min-width: 600px) 600px, 100vw"
          className="h-auto w-full"
          priority
          quality={85}
        />
      </div>

      {platform === 'non-mobile' ? (
        // PC는 QR 카드가 안내문 역할까지 하므로 위쪽 문구·화살표를 반복하지 않는다.
        // 하단 고정도 불필요 — 스토어 버튼처럼 탭 위에 띄워야 하는 요소가 아니다.
        <div className="pt-4">
          <AppDownloadQr />
        </div>
      ) : (
        <div className="fixed right-0 bottom-[var(--bottom-nav-padding,0px)] left-0 m-auto w-full max-w-[600px] bg-white px-5 pt-4 pb-8">
          <div className="flex flex-col items-center pb-6">
            <p className="pb-3 text-center text-sm text-gray-500">
              키워드를 등록하고
              <br />
              누구보다 빠르게 받아보세요
            </p>
            <ArrowDown color="var(--color-gray-300)" />
          </div>
          <div className="flex gap-x-2">
            {platform === 'android' && <AndroidDownloadButton />}

            {platform === 'apple' && <IosDownloadButton />}
          </div>
        </div>
      )}
    </div>
  );
}

function AndroidDownloadButton() {
  return (
    // 앱이 있으면 앱의 알림 탭이 바로 열린다(intent), 없으면 Play.
    <OpenInAppLink platform="android" path="/alarm" source="alarm_tab" className="w-full">
      <m.span
        className={cn(buttonClass(), 'flex items-center justify-center gap-x-2')}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Google />
        Google Play
      </m.span>
    </OpenInAppLink>
  );
}

function IosDownloadButton() {
  return (
    <OpenInAppLink platform="apple" path="/alarm" source="alarm_tab" className="w-full">
      <m.span
        className={cn(buttonClass(), 'flex items-center justify-center gap-x-2')}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Apple />
        App Store
      </m.span>
    </OpenInAppLink>
  );
}

function LoginGuide() {
  const router = useMyRouter();
  const handleCTAButton = () => {
    router.push(SIGNUP_PATH);
  };

  return (
    <div className="flex h-full flex-col text-center">
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <div className="pb-4">
          <Illust />
        </div>
        <div>
          <p className="pb-8 text-2xl font-semibold text-gray-900">
            키워드 알림은
            <br /> 로그인이 필요해요
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] px-5 pb-9">
        <Button onClick={handleCTAButton} className="self-end">
          이메일로 시작하기
        </Button>
        <p className="pt-6 text-sm">
          이미 지름알림 회원이신가요?
          <Link href={PAGE.LOGIN_BY_EMAIL} className="text-primary-800 pl-3">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
