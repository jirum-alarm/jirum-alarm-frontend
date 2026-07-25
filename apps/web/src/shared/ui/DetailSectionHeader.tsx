import { cn } from '@/shared/lib/cn';

import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** 타이틀 줄 우측 (툴팁, 더보기 등) */
  right?: ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
};

/**
 * 상세/콘텐츠 섹션 공통 타이틀·서브타이틀.
 * 페이지 GNB용 SectionHeader(중앙정렬·h-14)와 분리.
 */
export default function DetailSectionHeader({
  title,
  subtitle,
  right,
  className,
  as: Tag = 'h2',
}: Props) {
  return (
    <header className={cn(className)}>
      <div className="flex items-start justify-between gap-3">
        <Tag className="min-w-0 text-lg font-semibold text-gray-900">{title}</Tag>
        {right ? <div className="mt-0.5 shrink-0">{right}</div> : null}
      </div>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </header>
  );
}
