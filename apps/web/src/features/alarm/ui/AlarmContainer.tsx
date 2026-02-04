'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useEffect } from 'react';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import Button from '@/shared/ui/common/Button';
import { Apple, ArrowDown, Google, LoadingSpinner } from '@/shared/ui/common/icons';
import { Illust } from '@/shared/ui/common/icons/Illust';
import Link from '@/shared/ui/Link';

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
    return (
      <AppDownloadGuide
        platform={device.isApple ? 'apple' : device.isAndroid ? 'android' : 'non-mobile'}
      />
    );
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
      <p className="pb-7 text-2xl font-semibold">
        <span className="shadow-primary-500 inline-block font-extrabold shadow-[inset_0-12px_0]">
          지름알림
        </span>{' '}
        앱 다운받고
        <br /> 핫딜을 알림
        <span className="bg-primary-500 inline-flex h-2 w-2 rounded-full align-text-top"></span>{' '}
        으로 받아보세요!
      </p>
      <div className="animate-fade-in flex justify-center rounded-md bg-gray-100">
        <Image
          src={`https://cdn.jirum-alarm.com/assets/app_download_guide.webp`}
          alt="download app guide"
          width={335}
          height={400}
        />
      </div>

      <div className="fixed right-0 bottom-0 left-0 m-auto w-full max-w-[600px] bg-white px-5 pt-4 pb-8">
        <div className="flex flex-col items-center pb-6">
          <p className="pb-3 text-center text-sm text-gray-400">
            키워드 알림으로
            <br />
            누구보다 빠르게 핫딜 받기
          </p>
          <ArrowDown color="#D0D5DD" />
        </div>
        <div className="flex gap-x-2 pb-16">
          {platform === 'non-mobile' && (
            <>
              <AndroidDownloadButton />
              <IosDownloadButton />
            </>
          )}

          {platform === 'android' && <AndroidDownloadButton />}

          {platform === 'apple' && <IosDownloadButton />}
        </div>
      </div>
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
    <a
      href="https://play.google.com/store/apps/details?id=com.solcode.jirmalam"
      onClick={handleClick}
      className="w-full"
    >
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
    <a
      href="https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420"
      onClick={handleClick}
      className="w-full"
    >
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
