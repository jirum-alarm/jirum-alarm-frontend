import Image from 'next/image';
import Link from 'next/link';

import SectionHeader from '../SectionHeader';

const Talk = () => {
  return (
    <section className="flex w-full flex-col items-center bg-white py-20 lg:py-32">
      <SectionHeader
        keyword="오픈카톡방"
        title={
          <>
            <span>가볍게 시작!</span>
            <br />
            <span>카톡으로 핫딜 먼저 만나보세요</span>
          </>
        }
        className="pb-8 lg:pb-20"
      />
      <div className="mb-7 flex w-full max-w-7xl flex-col items-center gap-5 px-5 lg:flex-row lg:justify-center lg:gap-6">
        <div className="w-full max-w-132">
          <Image
            unoptimized
            src="/assets/images/talk-1.webp"
            alt="카톡방 이미지 1"
            width={1056}
            height={560}
          />
        </div>
        <div className="w-full max-w-132">
          <Image
            unoptimized
            src="/assets/images/talk-2.webp"
            alt="카톡방 이미지 2"
            width={1056}
            height={560}
          />
        </div>
      </div>
      <Link
        href="https://open.kakao.com/o/gJZTWAAg"
        target="_blank"
        className="flex gap-x-2 rounded-lg bg-gray-700 px-7 py-2.5"
      >
        <span className="font-bold text-white">핫딜 카톡방 입장하기</span>
        <Image src="/assets/icons/katalk.svg" alt="" width={24} height={24} />
      </Link>
    </section>
  );
};

export default Talk;
