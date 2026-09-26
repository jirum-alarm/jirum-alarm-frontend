import Image from 'next/image';
import Link from 'next/link';

// web LogoLink 와 같은 모양. 부제는 모바일에서만 — web 도 데스크톱 GNB 는 h-14 에 맞춰 한 줄로 둔다.
const Title = () => (
  <Link href="https://jirum-alarm.com" className="flex items-center gap-2 rounded-lg px-2 py-1">
    <Image src="/assets/icons/logo.svg" alt="" width={32} height={32} unoptimized />
    <span className="flex flex-col justify-center whitespace-nowrap">
      <h2 className="relative text-lg leading-tight font-bold text-gray-800">지름알림</h2>
      <span className="text-[11px] leading-tight text-gray-500 lg:hidden">
        커뮤니티 핫딜 모아보기
      </span>
    </span>
  </Link>
);

export default Title;
