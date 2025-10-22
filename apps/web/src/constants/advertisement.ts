import { period } from '@/util/date';

import { IS_PRD } from './env';

export class Advertisement {
  // 퍼실 2025-09-17 시작
  static readonly Persil = {
    // 퍼실광고
    isInPeriod: () => {
      if (IS_PRD) {
        return period('Asia/Seoul').startAt('2025-09-19 12:00').endAt('2025-09-26 23:59:59');
      } else {
        return period('Asia/Seoul').startAt('2025-09-27 22:10').endAt('2025-09-30 23:59:59');
      }
    },
    url: 'https://ibpartner.cafe24.com/',
    title: '헨켈 생필품 할인',
    discountRate: '73',
    description: '세제, 섬유유연제, 샴푸 모음전',
    period: '09.19 - 09.26',
  };

  // 비프록 음식물 처리기 2025-09-28 시작
  static readonly Beproc = {
    isInPeriod: () => {
      if (IS_PRD) {
        return period('Asia/Seoul').startAt('2025-09-28 00:00').endAt('2025-10-13 05:59:59'); // end: 추석 연휴
      } else {
        return period('Asia/Seoul').startAt('2025-09-27 22:10').endAt('2025-10-13 05:59:59'); // end: 추석 연휴
      }
    },
    url: 'https://smartstore.naver.com/beproc/products/12465286599',
    title: '비프록 음식물 처리기 추석특가',
    discountRate: '70',
    description: '오직 지름알림에서만 70% 할인',
    period: null,
  };

  static readonly Persil_20251022 = {
    isInPeriod: () => {
      return period('Asia/Seoul').startAt('2025-10-22 10:00').endAt('2025-10-31 23:59:59');
    },
    url: 'https://ibpartner.cafe24.com/',
    title: '헨켈 생필품 최대 77% 할인',
    discountRate: '77',
    description: '세제, 섬유유연제, 주방세제 모음전',
    period: '10.22 - 10.28',
  };
}
