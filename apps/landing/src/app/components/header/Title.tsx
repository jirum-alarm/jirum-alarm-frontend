import Image from 'next/image';
import Link from 'next/link';

const Title = () => (
  <Link href="https://www.jirum-alarm.com" target="_blank" className="flex items-center gap-2">
    <Image src="/assets/icons/logo.svg" alt="logo" width={32} height={32} />
    <span className="text-lg font-bold">지름알림</span>
  </Link>
);

export default Title;
