import Link from 'next/link';

import { cn } from '@/shared/libs/cn';

interface NavLinkProps {
  href: string;
  label: string;
  isActive?: boolean;
}

export default function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={cn('relative flex h-full items-center text-lg font-semibold', {
        'text-gray-900': isActive,
        'text-gray-700': !isActive,
      })}
    >
      {label}
      {isActive && <div className="bg-primary-500 absolute right-0 bottom-0 left-0 h-[2px]" />}
    </Link>
  );
}
