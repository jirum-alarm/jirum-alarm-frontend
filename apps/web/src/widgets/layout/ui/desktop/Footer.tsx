import Link from 'next/link';

import { IllustIcons } from '@/shared/ui/common/icons';
import TalkLight from '@/shared/ui/common/icons/TalkLight';

const Footer = () => {
  return (
    <div className="bg-surface-subtle relative flex w-full flex-col">
      <div className="flex items-end">
        <footer className="max-w-8xl mx-auto flex w-full flex-1 flex-col justify-between px-5 py-15 lg:px-20 lg:py-12">
          <div className="mb-5 flex justify-between">
            <div className="flex items-center gap-x-2.5">
              <IllustIcons.IconLogo />
              <p className="text-fg-primary text-2xl font-bold">지름알림</p>
            </div>
            <Link
              href="https://open.kakao.com/o/gJZTWAAg"
              target="_blank"
              aria-label="카카오톡 오픈채팅 바로가기"
              className="flex size-9 items-center justify-center rounded-full bg-[#FAE300]"
            >
              <TalkLight className="mt-0.5 mr-0.25" />
            </Link>
          </div>
          <p className="typography-body-14m mb-4 whitespace-pre-line text-gray-700">
            지름알림{'\n'}
            고객센터 :{' '}
            <Link href="mailto:jirumalarm@gmail.com" className="font-medium underline">
              jirumalarm@gmail.com
            </Link>
          </p>
          <div className="flex h-full flex-col justify-between lg:flex-row">
            <div className="flex gap-x-2 text-sm text-gray-600">
              <Link href="https://jirum-alarm.com/policies/terms" className="underline">
                서비스 이용약관
              </Link>
              <span className="text-fg-tertiary">ㅣ</span>
              <Link href="https://jirum-alarm.com/policies/privacy" className="underline">
                개인정보 처리방침
              </Link>
            </div>
            <p className="text-sm text-gray-600">Copyright 2025. 지름알림. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
