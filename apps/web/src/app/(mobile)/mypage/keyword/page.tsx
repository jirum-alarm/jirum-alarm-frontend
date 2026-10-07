import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import KeywordInput from '@/features/mypage/ui/keyword/KeywordInput';
import KeywordList from '@/features/mypage/ui/keyword/KeywordList';
import PushStatusBanner from '@/features/mypage/ui/keyword/PushStatusBanner';
import MySubscribedThemes from '@/features/mypage/ui/theme/MySubscribedThemes';

// focus: 알림 한 줄의 키워드 링크에서 들어오면 그 키워드를 맨 위에 펼쳐 둔다.
const KeywordPage = async ({ searchParams }: { searchParams: Promise<{ focus?: string }> }) => {
  const { focus } = await searchParams;
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="pc:pt-0 relative h-full px-5 py-6">
        <PushStatusBanner />
        {/* 특정 키워드를 고치러 왔으면 (모바일) 키보드가 그 카드를 가리지 않게 한다. */}
        <KeywordInput autoFocus={!focus} />
        <div className="h-8" />
        <Suspense>
          <KeywordList focus={focus} />
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
