import { RoundedLogo } from '@/components/common/icons';
import Link from '@/features/Link';
import { cn } from '@/lib/cn';

interface LogoLinkProps {
  inverted?: boolean;
}

export default function LogoLink({ inverted = false }: LogoLinkProps) {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center gap-2">
        <RoundedLogo size={28} />
        <h2
          className={cn('relative text-lg font-bold', {
            'text-white': inverted,
            'text-gray-800': !inverted,
          })}
        >
          지름알림
        </h2>
      </Link>
    </div>
  );
}
