'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { PAGE } from '@/shared/config/page';
import { ArrowRight } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';

const MyProfileSection = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());

  return (
    <div className="px-5">
      {/* 구분선은 한 종류로 — 아래 MenuList 와 같은 1px gray-200 이다.
          예전엔 여기만 2px gray-600 이라 한 화면에 두 굵기가 섞였다. */}
      <div className="border-b border-gray-200 py-8">
        <Link href={PAGE.MYPAGE_ACCOUNT}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{me?.nickname}</h2>
              {/* gray-400 은 대비 2.58:1 로 AA 미달 — 보조 라벨은 gray-500. */}
              <span className="text-xs text-gray-500">{me?.email}</span>
            </div>
            <div>
              <ArrowRight />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MyProfileSection;
