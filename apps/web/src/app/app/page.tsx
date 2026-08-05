import { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';

import { ANDROID_STORE_LINK, IOS_STORE_LINK } from '@/shared/config/appStore';

export const metadata: Metadata = {
  title: '지름알림 앱 설치',
  description: '키워드 알림으로 놓치기 쉬운 핫딜을 가장 먼저 받아보세요.',
  // QR 착지 전용 페이지 — 검색 결과에 뜰 이유가 없다.
  robots: { index: false, follow: false },
};

/**
 * PC에 노출한 QR의 착지 페이지.
 *
 * 즉시 리다이렉트하지 않는 이유: 스캔한 사람은 자기가 무엇을 받는지 모른 채
 * 스토어 앱으로 튕긴다. iOS에서는 브라우저 컨텍스트까지 사라져 스토어에서
 * 뒤로 가면 돌아올 곳이 없다. 한 번 눌러 이동하는 대신 무엇을 받는지 보여준다.
 *
 * isApple(agent.ts)을 쓰지 않는 이유: 그쪽은 Macintosh도 Apple로 잡아서
 * 맥 데스크톱이 App Store 앱 페이지로 떨어진다. 여기선 iOS 기기만 정확히 본다.
 */
export default async function AppInstallPage() {
  const ua = (await headers()).get('user-agent') ?? '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  const store = isIOS
    ? { href: IOS_STORE_LINK, label: 'App Store에서 받기' }
    : { href: ANDROID_STORE_LINK, label: 'Google Play에서 받기' };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center">
        {/* public/icon.png 은 못 쓴다 — src/app/icon.png(파비콘 규약)이 그 경로를 가로채 500. */}
        <Image
          src="/apple-touch-icon.png"
          alt="지름알림"
          width={80}
          height={80}
          className="rounded-2xl shadow-sm"
          priority
        />
        <h1 className="pt-6 text-2xl font-semibold text-gray-900">
          <span className="shadow-primary-500 inline-block font-extrabold shadow-[inset_0-12px_0]">
            지름알림
          </span>{' '}
          앱 설치
        </h1>
        <p className="pt-3 text-gray-500">
          키워드를 등록하고 놓치기 쉬운 핫딜을
          <br />
          알림으로 가장 먼저 받아보세요
        </p>
      </div>

      <a
        href={store.href}
        className="bg-primary-500 mt-10 flex h-14 w-full items-center justify-center rounded-xl font-semibold text-gray-900"
      >
        {store.label}
      </a>

      {/* UA 판정이 틀렸거나 다른 기기로 옮겨 설치하는 경우를 위한 탈출구. */}
      <a
        href={isIOS ? ANDROID_STORE_LINK : IOS_STORE_LINK}
        className="mt-3 flex h-11 w-full items-center justify-center text-sm text-gray-500"
      >
        {isIOS ? 'Android 기기인가요?' : 'iPhone인가요?'}
      </a>
    </main>
  );
}
