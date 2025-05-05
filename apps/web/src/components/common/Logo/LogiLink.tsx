import { Logo } from '@/components/common/icons';
import Link from '@/features/Link';

export default function LogoLink() {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center gap-2">
        <Logo size={28} />
        <h2 className="relative top-0.5 text-lg font-bold text-gray-800">지름알림</h2>
      </Link>
    </div>
  );
}
