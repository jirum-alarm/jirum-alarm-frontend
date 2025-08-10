import { IconLogo } from '@/components/common/icons/Illust';
import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

interface LogoLinkProps {
  inverted?: boolean;
}

export default function LogoLink({ inverted = false }: LogoLinkProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <IconLogo />
      <h2
        className={cn('relative text-lg font-bold', {
          'text-white': inverted,
          'text-gray-800': !inverted,
        })}
      >
        지름알림
      </h2>
    </Link>
  );
}
