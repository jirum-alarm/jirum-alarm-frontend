import {
  describeQuietHours,
  formatHour,
  toQuietHours,
} from '@/features/mypage/lib/quiet-hours';

describe('방해금지 시간 — web quiet-hours 와 같은 규칙', () => {
  it('오전·오후 12시간제로 쓴다', () => {
    expect([0, 9, 12, 18].map(formatHour)).toEqual([
      '오전 12시',
      '오전 9시',
      '오후 12시',
      '오후 6시',
    ]);
  });

  it('둘 중 하나라도 비었거나 같으면 꺼짐', () => {
    expect(toQuietHours(null, null)).toBeNull();
    expect(toQuietHours(9, null)).toBeNull();
    expect(toQuietHours(9, 9)).toBeNull();
    expect(toQuietHours(23, 7)).toEqual({start: 23, end: 7});
  });

  it('끝 시각에 모아 보낸다고 안내한다', () => {
    expect(describeQuietHours({start: 9, end: 18}, false)).toBe(
      '오전 9시부터 오후 6시 전까지 온 알림은 오후 6시에 모아서 보내드려요',
    );
  });

  it('야간 미동의인데 밤 시간만 고르면 원래 안 오는 시간이라고 알린다', () => {
    expect(describeQuietHours({start: 23, end: 7}, false)).toMatch(
      /원래 알림이 오지 않아요/,
    );
    expect(describeQuietHours({start: 23, end: 7}, true)).toMatch(
      /오전 7시에 모아서/,
    );
  });
});
