import { ArrowRight } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { MYPAGE_GROUPS, MYPAGE_MENU } from '../model/menu';

/** PC 마이페이지 첫 화면 — 메뉴를 설명 붙은 카드로, 사이드바와 같은 묶음. 프로필·고객센터·약관은 사이드바에만 있다. */
export default function MyPageOverview() {
  return (
    <div className="flex flex-col gap-8 px-5 pb-16">
      {/* ponytail: 지원(약관)은 카드로 크게 띄울 만한 게 아니라 사이드바에만 둔다. */}
      {MYPAGE_GROUPS.filter((group) => group.key !== 'support').map((group) => (
        <section key={group.key}>
          <h2 className="pb-3 text-sm font-semibold text-gray-500">{group.label}</h2>
          <ul className="grid grid-cols-2 gap-3">
            {MYPAGE_MENU.filter((menu) => menu.group === group.key).map((menu) => (
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
        </section>
      ))}
    </div>
  );
}
