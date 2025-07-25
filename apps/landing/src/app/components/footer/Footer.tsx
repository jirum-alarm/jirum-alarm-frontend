import Image from 'next/image';
import Link from 'next/link';

import Banner from './Banner';

const Footer = () => {
  return (
    <div className="relative flex w-full snap-start flex-col">
      <div className="to-landing-background pointer-events-none absolute bottom-0 -z-1 h-full max-h-lvh min-h-svh w-full bg-linear-to-b from-gray-900" />
      <Banner />
      <div className="flex items-end lg:h-[30vh]">
        <footer className="max-w-8xl mx-auto flex w-full flex-1 flex-col justify-between px-5 py-15 lg:px-20 lg:py-12">
          <div className="mb-5 flex justify-between">
            <div className="flex items-center gap-x-2.5">
              <Image
                src="/assets/icons/logo.svg"
                alt="logo"
                className="size-7"
                width={32}
                height={32}
              />
              <p className="text-2xl font-bold text-white">지름알림</p>
            </div>
            <Link
              href="https://open.kakao.com/o/gJZTWAAg"
              target="_blank"
              className="flex size-9 items-center justify-center rounded-full bg-[#FAE300]"
            >
              <Image src="/assets/icons/katalk2.svg" alt="katalk" width={30} height={31} />
            </Link>
          </div>
          <p className="mb-4 text-sm font-medium whitespace-pre-line text-white">
            지름알림{'\n'}
            고객센터 :{' '}
            <Link href="mailto:jirumalarm@gmail.com" className="font-medium underline">
              jirumalarm@gmail.com
            </Link>
          </p>
          <div className="flex h-full flex-col justify-between lg:flex-row">
            <div className="flex gap-x-2 text-sm text-gray-300">
              <Link href="https://jirum-alarm.com/policies/terms" className="underline">
                서비스 이용약관
              </Link>
              <span>ㅣ</span>
              <Link href="https://jirum-alarm.com/policies/privacy" className="underline">
                개인정보 처리방침
              </Link>
            </div>
            <p className="text-sm text-gray-400">Copyright 2025. 지름알림. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
