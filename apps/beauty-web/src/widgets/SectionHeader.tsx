import { sectionTitle } from '@jirum/design-system/recipes';
import Link from 'next/link';

import { ArrowRightIcon } from '@/shared/ui/icons';

/** 홈 섹션 제목(h2) + 오른쪽 「더보기」 — web shared/ui/SectionHeader 와 같은 높이·글자(sectionTitle.page). */
export default function SectionHeader({
  title,
  subtitle,
  moreHref,
  moreLabel = '더보기',
}: {
  title: string;
  subtitle?: string;
  /** 이 앱 안 경로(next/link — basePath 가 붙는다). */
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <h2 className={sectionTitle.page}>{title}</h2>
        {subtitle && <p className={sectionTitle.subtitle}>{subtitle}</p>}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="flex shrink-0 items-center text-sm text-gray-600 hover:text-gray-900"
        >
          {moreLabel}
          <ArrowRightIcon className="-mr-1" />
        </Link>
      )}
    </div>
  );
}
