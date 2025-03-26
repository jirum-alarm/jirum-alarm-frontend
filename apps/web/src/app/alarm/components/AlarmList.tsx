'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import Button from '@/components/common/Button';
import { Apple, ArrowDown, Google } from '@/components/common/icons';
import Illust from '@/components/common/Illust';
import Link from '@/features/Link';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';

import { useNotificationsViewModel } from '../hooks/useNotificationsViewModel';

import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';

const SIGNUP_PATH = '/signup';
const EMAIL_LOGIN_PATH = '/login/email';

const AlarmList = () => {
  const { isApple, isAndroid, isJirumAlarmApp } = useDevice();

  const { notifications, loading, isNotLogin, noData, hasNextData, ref } =
    useNotificationsViewModel();

  if (loading) {
    return;
  }

  if (isNotLogin && !isJirumAlarmApp) {
    return <AppDownloadGuide platform={isApple ? 'apple' : isAndroid ? 'android' : 'non-mobile'} />;
  }

  if (isNotLogin && isJirumAlarmApp) {
    return <LoginGuide />;
  }

  if (noData) {
    return <NoAlerts />;
  }

  return (
    <>
      <ul>
        {notifications.map((notification) => (
          <AlarmItem key={notification.id} notification={notification} />
        ))}
      </ul>

      {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
    </>
  );
};

export default AlarmList;

function AppDownloadGuide({ platform }: { platform: 'apple' | 'android' | 'non-mobile' }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="flex h-full flex-col px-5 pb-8 pt-9">
      <p className="pb-7 text-2xl font-semibold">
        <span className="inline-block w-[85px] font-extrabold shadow-[inset_0-12px_0] shadow-primary-500">
          지름알림
        </span>{' '}
        앱 다운받고
        <br /> 핫딜을 알림
        <span className="inline-flex h-2 w-2 rounded-full bg-primary-500 align-text-top"></span>{' '}
        으로 받아보세요!
      </p>
      <div className="flex animate-fade-in justify-center rounded-md bg-gray-100">
        <Image
          src={`https://cdn.jirum-alarm.com/assets/app_download_guide.webp`}
          alt="download app guide"
          width={335}
          height={400}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[480px] bg-white px-5 pb-8 pt-4">
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
      <button className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-primary-500 py-3 font-semibold text-gray-900">
        <Google />
        Google Play
      </button>
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
      <button className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-primary-500 py-3 font-semibold text-gray-900">
        <Apple />
        App Store
      </button>
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
          <Illust size="sm" />
        </div>
        <div>
          <p className="pb-8 text-2xl font-semibold text-gray-900">
            키워드 알림은
            <br /> 로그인이 필요해요
          </p>
        </div>
      </div>
      <div className="w-full max-w-[480px] px-5 pb-9">
        <Button onClick={handleCTAButton} className="self-end">
          이메일로 시작하기
        </Button>
        <p className="pt-6 text-sm">
          이미 지름알림 회원이신가요?
          <Link href={EMAIL_LOGIN_PATH} className="pl-3 text-primary-700">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
