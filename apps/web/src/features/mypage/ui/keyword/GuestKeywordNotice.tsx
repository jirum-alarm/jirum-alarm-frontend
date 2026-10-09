'use client';

import { useAtomValue } from 'jotai';

import { PAGE } from '@/shared/config/page';
import { isGuestAtom } from '@/shared/hooks/useIsLoggedIn';
import Link from '@/shared/ui/Link';

/**
 * 게스트(로그인 없이 알림만 받는 기기 계정)에게: 키워드는 이 기기에 저장돼 있고, 로그인하면 계정으로 옮겨진다.
 * 로그인을 막는 벽이 아니라 선택지로 둔다 — 알림은 이미 받고 있다.
 */
const GuestKeywordNotice = () => {
  const isGuest = useAtomValue(isGuestAtom);
  if (!isGuest) return null;

  return (
    <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
      <p className="font-medium text-gray-900">로그인하지 않아도 알림을 보내드려요</p>
      <p className="mt-1 text-xs text-gray-500">
        키워드는 이 기기에 저장돼요. 로그인하면 계정으로 옮겨져서 앱이나 다른 기기에서도 받을 수
        있어요.
      </p>
      <Link
        href={`${PAGE.LOGIN}?rtnUrl=${encodeURIComponent(PAGE.MYPAGE_KEYWORD)}`}
        className="mt-3 inline-block rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900"
      >
        로그인하고 계정에 저장
      </Link>
    </div>
  );
};

export default GuestKeywordNotice;
