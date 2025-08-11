import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

interface MenuLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  isInverted: boolean;
  prefetch?: boolean;
}

export default function NavLink({
  href,
  label,
  isActive,
  isInverted,
  prefetch = true,
}: MenuLinkProps) {
  return (
    <Link
      prefetch={prefetch}
      href={href}
      className={cn('relative flex h-full items-center text-lg font-semibold', {
        'text-white': isActive,
        'text-gray-200': !isActive,
        'text-gray-900': isActive && !isInverted,
        'text-gray-700': !isActive && !isInverted,
      })}
    >
      {label}
      {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-500" />}
    </Link>
  );
}
