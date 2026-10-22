import {
  fullRows,
  isTwoPane,
  twoPaneMediaSize,
} from '@/shared/hooks/useWideLayout';

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

describe('상세 나누기 — 넓은 가로 화면만', () => {
  it('듀오 펼침 가로·가로 아이폰은 나누고, 세로는 넓어도 한 줄', () => {
    expect(isTwoPane(867, 669)).toBe(true); // 듀오 펼침 가로(오른쪽 기둥 84 뺌)
    expect(isTwoPane(750, 402)).toBe(true); // 가로 아이폰(노치 양쪽 뺌)
    expect(isTwoPane(669, 951)).toBe(false); // 듀오 펼침 세로
    expect(isTwoPane(382, 678)).toBe(false); // 듀오 바깥·폰
    expect(isTwoPane(678, 382)).toBe(false); // 바깥 화면 가로 — 좁아서 한 줄
  });

  it('왼쪽 사진은 폭 45%·폰 폭 440·쓸 수 있는 높이 중 작은 값', () => {
    expect(twoPaneMediaSize(867, 500)).toBe(390);
    expect(twoPaneMediaSize(1300, 900)).toBe(440);
    expect(twoPaneMediaSize(750, 260)).toBe(260); // 가로 아이폰은 높이가 모자란다
  });
});
