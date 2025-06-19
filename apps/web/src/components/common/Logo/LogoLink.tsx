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
          className={cn('relative top-0.5 text-lg font-bold text-gray-800', {
            'lg:text-white': inverted,
            'lg:text-gray-800': !inverted,
          })}
        >
          지름알림
        </h2>
      </Link>
    </div>
  );
}
