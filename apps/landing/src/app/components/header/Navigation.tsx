import Image from 'next/image';

import { PAGE } from '@/shared/constants/page';

const talkroomLink = 'https://open.kakao.com/o/gJZTWAAg';

// web 과 같게: 데스크톱은 핫딜 등록·검색·카톡·로그인, 모바일은 검색만(web 모바일 헤더와 동일).
const GnbActions = () => (
  <div className="flex items-center gap-x-5">
    <a
      href={PAGE.BASE + PAGE.PRODUCT_NEW}
      className="hidden rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 lg:block"
    >
      핫딜 등록
    </a>
    <a
      className="-m-2 flex items-center justify-center p-2 lg:m-0 lg:size-9 lg:rounded-full lg:p-0 lg:hover:bg-gray-100"
      href={PAGE.BASE + PAGE.SEARCH}
      aria-label="검색"
    >
      <Image
        className="size-6 lg:size-7"
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
      className="hidden size-9 items-center justify-center rounded-full p-1 hover:bg-gray-100 lg:flex"
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
      className="hidden rounded-full bg-gray-700 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-gray-600 lg:block"
    >
      로그인
    </a>
  </div>
);

export default GnbActions;
