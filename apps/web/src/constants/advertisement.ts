import { period } from '@/util/date';

export class Advertisement {
  // 퍼실 2025-09-17 시작
  static readonly Persil = {
    // 'Asia/Seoul'
    isInPeriod: () => period('Asia/Seoul').startAt('2025-09-18 22:10').endAt('2025-09-18 23:59:59'),
    url: 'https://www.persil.co.kr/',
  };
}
