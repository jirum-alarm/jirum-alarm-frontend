import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import KeywordInput from '@/features/mypage/ui/keyword/KeywordInput';
import KeywordList from '@/features/mypage/ui/keyword/KeywordList';
import PushStatusBanner from '@/features/mypage/ui/keyword/PushStatusBanner';
import MySubscribedThemes from '@/features/mypage/ui/theme/MySubscribedThemes';

const KeywordPage = () => {
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="relative h-full px-5 py-6">
        <PushStatusBanner />
        <KeywordInput />
        <div className="h-8" />
        <Suspense>
          <KeywordList />
        </Suspense>
        {/* 구독한 관심사 — 입력창 바로 아래는 "방금 넣은 키워드가 어디 갔나"가 보여야 해서 목록 다음에 둔다. */}
        <div className="h-8" />
        <Suspense>
          <MySubscribedThemes />
        </Suspense>
        <div className="h-32" />
      </div>
    </BasicLayout>
  );
};

export default KeywordPage;
