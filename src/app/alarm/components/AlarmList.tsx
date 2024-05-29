'use client';

import Image from 'next/image';
import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';
import { useNotificationsViewModel } from '../hooks/useNotificationsViewModel';
import { useDevice } from '@/hooks/useDevice';
import { appDownloadGuide } from '@/assets/images/app_download_guide';
import { Apple, ArrowDown, Google } from '@/components/common/icons';
import { useEffect, useRef } from 'react';
import Illust from '@/components/common/Illust';
import Button from '@/components/common/Button';
import Link from '@/features/Link';
import { useRouter } from 'next/navigation';

const SIGNUP_PATH = '/signup';
const EMAIL_LOGIN_PATH = '/login/email';

const AlarmList = () => {
  const { isIos, isAndroid, isJirumAlarmApp } = useDevice();

  const { notifications, loading, isNotLogin, noData, hasNextData, ref } =
    useNotificationsViewModel();

  if (loading) {
    return;
  }

  if (isNotLogin && !isJirumAlarmApp) {
    return <AppDownloadGuid platform={isIos ? 'ios' : isAndroid ? 'android' : 'non-mobile'} />;
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

function AppDownloadGuid({ platform }: { platform: 'ios' | 'android' | 'non-mobile' }) {
  const ctaButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ctaButtonContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="flex h-full flex-col px-5 pb-8 pt-9">
      <p className="pb-7 text-2xl font-semibold">
        <span className="inline-block w-[85px] font-extrabold shadow-[inset_0-12px_0] shadow-primary-500">
          지름알림
        </span>{' '}
        앱 다운받고
        <br /> 핫딜을 알림
        <span className="inline-block h-2 w-2 rounded-full bg-primary-500 align-text-top"> </span>
        으로 받아보세요!
      </p>
      <div className="flex justify-center rounded-md bg-gray-100">
        <Image src={appDownloadGuide} alt="download app guide" width={335} height={400} />
      </div>
      <div className="flex-1 content-end pt-4">
        <div className="flex flex-col items-center pb-3 text-center">
          <p className=" pb-3 text-sm text-gray-400">
            키워드 알림으로
            <br />
            누구보다 빠르게 핫딜 받기
          </p>
          <ArrowDown color="#D0D5DD" className="animate-bounce" />
        </div>
        <div ref={ctaButtonContainerRef} className="flex gap-x-2">
          {platform === 'non-mobile' && (
            <>
              <AndroidDownloadButton />
              <IosDownloadButton />
            </>
          )}

          {platform === 'android' && <AndroidDownloadButton />}

          {platform === 'ios' && <IosDownloadButton />}
        </div>
      </div>
    </div>
  );
}

function AndroidDownloadButton() {
  return (
    <a href="https://play.google.com/store/apps/details?id=com.solcode.jirmalam" className="w-full">
      <button className="flex w-full items-center justify-center gap-x-2 rounded-lg bg-primary-500 py-3 font-semibold text-gray-900">
        <Google />
        Google Play
      </button>
    </a>
  );
}

function IosDownloadButton() {
  return (
    <a
      href="https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420"
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
  const router = useRouter();
  const handleCTAButton = () => {
    router.push(SIGNUP_PATH);
  };

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col pt-14 text-center">
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
