import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { describeQuietHours, formatHour, NIGHT_HOURS_TEXT, toQuietHours } =
  require('./quiet-hours.ts') as typeof import('./quiet-hours');

describe('formatHour', () => {
  it('오전·오후 12시간제로 쓴다', () => {
    assert.equal(formatHour(0), '오전 12시');
    assert.equal(formatHour(9), '오전 9시');
    assert.equal(formatHour(12), '오후 12시');
    assert.equal(formatHour(18), '오후 6시');
  });
});

describe('toQuietHours', () => {
  it('둘 중 하나라도 비었거나 같으면 꺼짐', () => {
    assert.equal(toQuietHours(null, null), null);
    assert.equal(toQuietHours(9, null), null);
    assert.equal(toQuietHours(9, 9), null);
    assert.deepEqual(toQuietHours(23, 7), { start: 23, end: 7 });
  });
});

describe('describeQuietHours', () => {
  it('끝 시각에 모아 보낸다고 안내한다', () => {
    assert.equal(
      describeQuietHours({ start: 9, end: 18 }, false),
      '오전 9시부터 오후 6시 전까지 온 알림은 오후 6시에 모아서 보내드려요',
    );
  });

  it('야간 미동의인데 밤 시간만 고르면 원래 안 오는 시간이라고 알린다', () => {
    assert.match(describeQuietHours({ start: 23, end: 7 }, false), /원래 알림이 오지 않아요/);
  });

  it('야간 동의자가 밤 시간을 고르면 그대로 모아 보낸다', () => {
    assert.match(describeQuietHours({ start: 23, end: 7 }, true), /오전 7시에 모아서/);
  });

  it('밤에 걸쳐도 낮 시간이 끼면 일반 안내', () => {
    assert.match(describeQuietHours({ start: 6, end: 10 }, false), /오전 10시에 모아서/);
  });
});

describe('NIGHT_HOURS_TEXT', () => {
  it('소개·사용법 문구에 들어가는 야간 시간', () => {
    assert.equal(NIGHT_HOURS_TEXT, '밤 9시부터 아침 8시');
  });
});
