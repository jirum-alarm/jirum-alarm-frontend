import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import KeywordInput from '@/features/mypage/ui/keyword/KeywordInput';
import KeywordList from '@/features/mypage/ui/keyword/KeywordList';
import PriceDropOnlyToggle from '@/features/mypage/ui/keyword/PriceDropOnlyToggle';
import MySubscribedThemes from '@/features/mypage/ui/theme/MySubscribedThemes';

const KeywordPage = () => {
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="relative h-full px-5 py-6">
        <KeywordInput />
        <div className="h-6" />
        {/* 하락 전용 필터 — 별도 알림 종류가 아니라 키워드 알림의 필터라 여기에 둔다 */}
        <Suspense>
          <PriceDropOnlyToggle />
        </Suspense>
        <div className="h-8" />
        {/* 구독한 묶음 — 키워드와 한 화면에서 통합 관리 (묶음 배지) */}
        <Suspense>
          <MySubscribedThemes />
        </Suspense>
        <Suspense>
          <KeywordList />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default KeywordPage;
