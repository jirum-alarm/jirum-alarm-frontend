import { ArrowRight } from '@/components/common/icons';
import Link from 'next/link';
import React from 'react';

interface MovePageProps {
  to: string;
  title: string;
  subtitle?: string;
}

const MovePage = ({ to, title, subtitle }: MovePageProps) => {
  return (
    <Link href={to}>
      <div className="flex justify-between py-3">
        <div>
          <span className="text-sm text-gray-600">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {subtitle && <span className="text-sm text-gray-900"> {subtitle}</span>}
          <ArrowRight />
        </div>
      </div>
    </Link>
  );
};

export default MovePage;
