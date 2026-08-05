'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useEffect } from 'react';

import { ANDROID_STORE_LINK, IOS_STORE_LINK } from '@/shared/config/appStore';
import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import Button from '@/shared/ui/common/Button';
import { Apple, ArrowDown, Google, LoadingSpinner } from '@/shared/ui/common/icons';
import { Illust } from '@/shared/ui/common/icons/Illust';
import Link from '@/shared/ui/Link';

import { resolveAppDownloadPlatform } from '@/features/app-download/model/resolvePlatform';
import AppDownloadQr from '@/features/app-download/ui/AppDownloadQr';

import AlarmList from './AlarmList';

const SIGNUP_PATH = '/signup';

const AlarmContainer = () => {
  const { device, isHydrated } = useDevice();

  const { isLoggedIn, isLoading } = useIsLoggedIn();

  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
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
        <span className="shadow-primary-500 inline-block font-extrabold shadow-[inset_0-12px_0]">
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
            <p className="pb-3 text-center text-sm text-gray-400">
              키워드를 등록하고
              <br />
              누구보다 빠르게 받아보세요
            </p>
            <ArrowDown color="#D0D5DD" />
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
  const handleClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.APP_DOWNLOAD_LINK_CLICK.NAME, {
    //   type: EVENT.APP_DOWNLOAD_LINK_CLICK.TYPE.ANDROID,
    //   page: EVENT.PAGE.ALARM,
    // });
  };

  return (
    <a href={ANDROID_STORE_LINK} onClick={handleClick} className="w-full">
      <motion.button
        className="bg-primary-500 flex w-full items-center justify-center gap-x-2 rounded-lg py-3 font-semibold text-gray-900"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Google />
        Google Play
      </motion.button>
    </a>
  );
}

function IosDownloadButton() {
  const handleClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.APP_DOWNLOAD_LINK_CLICK.NAME, {
    //   type: EVENT.APP_DOWNLOAD_LINK_CLICK.TYPE.IOS,
    //   page: EVENT.PAGE.ALARM,
    // });
  };

  return (
    <a href={IOS_STORE_LINK} onClick={handleClick} className="w-full">
      <motion.button
        className="bg-primary-500 flex w-full items-center justify-center gap-x-2 rounded-lg py-3 font-semibold text-gray-900"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Apple />
        App Store
      </motion.button>
    </a>
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
          <Link href={PAGE.LOGIN_BY_EMAIL} className="text-primary-700 pl-3">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
