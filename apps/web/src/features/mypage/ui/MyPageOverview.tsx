import { ArrowRight } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { MYPAGE_MENU } from '../model/menu';

/** PC 마이페이지 첫 화면 — 메뉴를 설명 붙은 카드로. 프로필·고객센터는 사이드바에 있다. */
export default function MyPageOverview() {
  return (
    <ul className="grid grid-cols-2 gap-3 px-5 pb-16">
      {MYPAGE_MENU.map((menu) => (
        <li key={menu.url}>
          <Link
            href={menu.url}
            className="flex h-full items-center gap-4 rounded-xl border border-gray-200 px-5 py-5 hover:bg-gray-50"
          >
            {menu.icon}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{menu.title}</p>
              <p className="truncate pt-0.5 text-sm text-gray-500">{menu.description}</p>
            </div>
            <ArrowRight />
          </Link>
        </li>
      ))}
    </ul>
  );
}
