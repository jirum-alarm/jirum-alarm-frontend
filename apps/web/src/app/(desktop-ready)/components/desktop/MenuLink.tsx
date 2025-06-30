import Link from '@/features/Link';
import { cn } from '@/lib/cn';

interface MenuLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

export default function MenuLink({ href, label, isActive }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className={cn('relative flex h-full items-center text-lg font-semibold', {
        'text-white': isActive,
        'text-gray-200': !isActive,
      })}
    >
      {label}
      {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-500" />}
    </Link>
  );
}
