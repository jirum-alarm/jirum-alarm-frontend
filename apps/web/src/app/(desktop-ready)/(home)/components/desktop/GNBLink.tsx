import { usePathname } from 'next/navigation';

import Link from '@/features/Link';
import { cn } from '@/lib/cn';

interface GNBLinkProps {
  href: string;
  label: string;
}

const GNBLink = ({ href, label }: GNBLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn('h-full border-b-2 border-transparent text-sm font-medium text-gray-900', {
        'border-primary-500': isActive,
      })}
    >
      {label}
    </Link>
  );
};
