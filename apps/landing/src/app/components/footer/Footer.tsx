import Image from 'next/image';
import Link from 'next/link';

import Banner from './Banner';

const Footer = () => {
  return (
    <div className="jusitfy-end relative flex w-full flex-col">
      <div className="to-landing-background pointer-events-none absolute bottom-0 -z-1 h-screen w-full bg-linear-to-b from-gray-900" />
      <Banner />
      <footer className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 pb-15 lg:px-20 lg:py-12">
        <div className="mb-5 flex justify-between">
          <div className="flex gap-x-2.5">
            <Image src="/icons/logo.svg" alt="logo" width={28} height={28} />
            <p className="text-2xl font-bold text-white">지름알림</p>
          </div>
          <Link
            href="#"
            target="_blank"
            className="flex size-9 items-center justify-center rounded-full bg-[#FAE300]"
          >
            <Image src="/icons/katalk2.svg" alt="katalk" width={30} height={31} />
          </Link>
        </div>
        <p className="mb-4 text-sm font-medium whitespace-pre-line text-white">
          지름알림{'\n'}고객센터 : jirumalarm@gmail.com
        </p>
        <div className="flex h-full flex-col items-end justify-between lg:flex-row">
          <div className="flex gap-x-2 text-sm text-gray-300">
            <Link href="#" className="underline">
              서비스 이용약관
            </Link>
            <span>ㅣ</span>
            <Link href="#" className="underline">
              개인정보 처리방침
            </Link>
          </div>
          <p className="text-sm text-gray-400">Copyright 2025. 지름알림. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
