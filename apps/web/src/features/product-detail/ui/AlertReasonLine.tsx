'use client';

import { describeAlertReason, parseAlertReason } from '@jirum/domain/alert-reason';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { themePath } from '@/shared/api/notification/theme.service';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';

import { ThemeQueries } from '@/entities/notification';

/**
 * 알림을 눌러 들어온 상세 맨 위 한 줄 — «왜 이 딜이 왔나» + 그 알림을 고치는 화면(키워드 설정·관심사·알림 설정).
 * 규칙·문구는 @jirum/domain/alert-reason 한 곳(앱 screens/detail/ui/AlertReasonLine 과 같다).
 * 알림 URL 의 utm 만 읽으니 서버 렌더·캐시와 무관하다 — 알림이 아니면 아무것도 그리지 않는다.
 */
export default function AlertReasonLine({ className }: { className?: string }) {
  const reason = parseAlertReason(useSearchParams());
  const { data: themes } = useQuery({
    ...ThemeQueries.themes(),
    enabled: reason?.kind === 'theme',
  });
  if (!reason) return null;
  const copy = describeAlertReason(reason, themes ?? []);
  if (!copy) return null;

  const theme =
    reason.kind === 'theme' ? themes?.find((t) => String(t.id) === reason.themeId) : undefined;
  const href =
    reason.kind === 'keyword'
      ? `${PAGE.MYPAGE_KEYWORD}?focus=${encodeURIComponent(reason.keyword)}`
      : theme
        ? themePath(theme)
        : '/mypage/notification';

  return (
    <p
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600',
        className,
      )}
    >
      <span className="line-clamp-2">🔔 {copy.text}</span>
      <Link
        href={href}
        data-track="alert-reason-link"
        data-source={reason.kind}
        className="shrink-0 font-medium text-gray-700 hover:underline"
      >
        {copy.action} ›
      </Link>
    </p>
  );
}
