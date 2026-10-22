import {fullRows} from '@/shared/hooks/useWideLayout';

describe('fullRows — 미리보기 그리드는 꽉 찬 줄까지만', () => {
  const six = [1, 2, 3, 4, 5, 6];

  it('폰(2·3열)에선 6개가 그대로', () => {
    expect(fullRows(six, 2)).toEqual(six);
    expect(fullRows(six, 3)).toEqual(six);
  });

  it('열이 늘면 덜 찬 마지막 줄을 뺀다', () => {
    expect(fullRows(six, 4)).toEqual([1, 2, 3, 4]);
    expect(fullRows(six, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('한 줄도 못 채우면 그대로 둔다', () => {
    expect(fullRows([1, 2], 4)).toEqual([1, 2]);
  });
});
