import Image from 'next/image';
import Link from 'next/link';

const Title = () => (
  <Link href="https://jirum-alarm.com" className="flex items-center gap-2">
    <Image src="/assets/icons/logo.svg" alt="" width={32} height={32} unoptimized />
    <h2 className="relative text-lg font-bold text-gray-800">지름알림</h2>
  </Link>
);

export default Title;
