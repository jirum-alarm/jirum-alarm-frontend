import Link from 'next/link';
import { Logo } from '@/components/common/icons';

export default function LogoLink() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/" className="flex items-center">
        <Logo className="h-8 w-8" />
        <h2 className="relative top-0.5 text-lg font-medium text-gray-800">지름알림</h2>
      </Link>
    </div>
  );
}
