import Link from 'next/link';

import { IllustIcons } from '@shared/ui/icons';
import TalkLight from '@shared/ui/icons/TalkLight';

const Footer = () => {
  return (
    <div className="relative flex w-full flex-col bg-gray-50">
      <div className="flex items-end">
        <footer className="max-w-8xl mx-auto flex w-full flex-1 flex-col justify-between px-5 py-15 lg:px-20 lg:py-12">
          <div className="mb-5 flex justify-between">
            <div className="flex items-center gap-x-2.5">
              <IllustIcons.IconLogo />
              <p className="text-2xl font-bold text-gray-900">지름알림</p>
            </div>
            <Link
              href="https://open.kakao.com/o/gJZTWAAg"
              target="_blank"
              className="flex size-9 items-center justify-center rounded-full bg-[#FAE300]"
            >
              <TalkLight className="mt-0.5 mr-0.25" />
            </Link>
          </div>
          <p className="mb-4 text-sm font-medium whitespace-pre-line text-gray-700">
            지름알림{'\n'}
            고객센터 :{' '}
            <Link href="mailto:jirumalarm@gmail.com" className="font-medium underline">
              jirumalarm@gmail.com
            </Link>
          </p>
          <div className="flex h-full flex-col justify-between lg:flex-row">
            <div className="flex gap-x-2 text-sm text-gray-500">
              <Link href="https://jirum-alarm.com/policies/terms" className="underline">
                서비스 이용약관
              </Link>
              <span className="text-gray-300">ㅣ</span>
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
