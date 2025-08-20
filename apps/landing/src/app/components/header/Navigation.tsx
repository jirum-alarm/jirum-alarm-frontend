import Image from 'next/image';
import Link from 'next/link';

import { PAGE } from '@/shared/constants/page';

const talkroomLink = 'https://open.kakao.com/o/gJZTWAAg';

const GnbActions = () => (
  <div className="flex items-center gap-x-5">
    <a
      className="flex size-8 items-center justify-center rounded-full p-1 hover:bg-gray-100 lg:size-9"
      href={PAGE.BASE + PAGE.SEARCH}
      aria-label="검색"
    >
      <Image
        className="size-full"
        src="/assets/icons/search.svg"
        alt=""
        width={28}
        height={28}
        unoptimized
      />
    </a>
    <a
      href={talkroomLink}
      target="_blank"
      aria-label="핫딜 카톡방 입장"
      className="flex size-8 items-center justify-center rounded-full p-1 hover:bg-gray-100 lg:size-9"
    >
      <Image
        src="/assets/icons/katalk2.svg"
        alt=""
        className="size-full"
        width={28}
        height={28}
        unoptimized
      />
    </a>
    <a
      href={PAGE.BASE + PAGE.LOGIN}
      className="rounded-full bg-gray-700 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-gray-600"
    >
      로그인
    </a>
    {/* <Link
      href={PAGE.BASE + PAGE.SIGNUP}
      target="_blank"
      className="bg-primary-500 hidden rounded-full px-4 py-1.5 font-bold lg:block"
    >
      회원가입
    </Link> */}
  </div>
);

export default GnbActions;
