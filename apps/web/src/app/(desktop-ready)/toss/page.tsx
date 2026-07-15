import { Metadata } from 'next';
import { Suspense } from 'react';

import TossDailyContainer from './TossDailyContainer';

export const metadata: Metadata = {
  title: '토스 하루특가 | 지름알림',
  description: '오늘만 이 가격, 토스 하루특가를 지름알림에서 한눈에.',
};

export default function TossDailyPage() {
  // useSearchParams 는 Suspense 경계 필요(App Router).
  return (
    <Suspense>
      <TossDailyContainer />
    </Suspense>
  );
}
