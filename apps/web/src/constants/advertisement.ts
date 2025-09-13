import { period } from '@/util/date';

export class Advertisement {
  // 퍼실 2025-09-17 시작
  static readonly Persil = {
    isInPeriod: period('Asia/Seoul').start('2025-09-14').end('2025-09-23'),
    url: 'https://www.persil.co.kr/',
  };
}
