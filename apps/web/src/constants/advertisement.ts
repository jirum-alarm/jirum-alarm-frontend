import { period } from '@/util/date';

import { IS_PRD } from './env';

export class Advertisement {
  // 퍼실 2025-09-17 시작
  static readonly Persil = {
    // 퍼실광고
    isInPeriod: () => {
      if (IS_PRD) {
        return period('Asia/Seoul').startAt('2025-09-19 12:00').endAt('2025-09-25 23:59:59');
      } else {
        return period('Asia/Seoul').startAt('2025-09-18 22:10').endAt('2025-09-19 23:59:59');
      }
    },
    url: 'https://ibpartner.cafe24.com/',
    title: '헨켈 생필품 할인',
    discountRate: '73',
    description: '세제, 섬유유연제, 샴푸 모음전',
    period: '09.19 - 09.25',
  };
}
