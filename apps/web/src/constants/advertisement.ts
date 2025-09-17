import { period } from '@/util/date';

export class Advertisement {
  // 퍼실 2025-09-17 시작
  static readonly Persil = {
    // 'Asia/Seoul'
    // isInPeriod: period('America/New_York').start('2025-09-14').end('2025-09-23'),
    isInPeriod: () => period('Asia/Seoul').startAt('2025-09-14').endAt('2025-09-23'),
    url: 'https://www.persil.co.kr/',
  };
}
