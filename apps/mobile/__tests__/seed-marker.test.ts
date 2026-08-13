export {};

const {
  isSeedDeal,
  resolveCurrentProductMarker,
} = require('../src/features/price-history/model/seed-marker');

describe('가격 차트 이 상품 마커', () => {
  it('isSeed 딜을 이 상품으로 본다', () => {
    expect(isSeedDeal({id: 99, isSeed: true}, 1)).toBe(true);
    expect(isSeedDeal({id: 1, isSeed: false}, 1)).toBe(true);
    expect(isSeedDeal({id: 2, isSeed: false}, 1)).toBe(false);
  });

  it('포인트에 seed 가 있으면 그 날짜·실제가로 찍는다', () => {
    const marker = resolveCurrentProductMarker(
      [
        {
          date: '2026-03-01',
          price: 9000,
          deal: {id: 1, isSeed: true, parsedPrice: 12000},
        },
        {date: '2026-03-02', price: 8000, deal: {id: 2, isSeed: false}},
      ],
      1,
      11000,
      '2026-03-10T00:00:00.000Z',
    );
    expect(marker).toEqual({date: '2026-03-01', price: 12000});
  });

  it('seed 가 없으면 postedAt 날짜에 현재가로 합성하고 오늘로 찍지 않는다', () => {
    const marker = resolveCurrentProductMarker(
      [{date: '2026-03-02', price: 8000, deal: {id: 2, isSeed: false}}],
      1,
      11000,
      '2026-01-15T15:00:00.000Z',
    );
    expect(marker).toEqual({date: '2026-01-16', price: 11000});
  });

  it('postedAt 이 없으면 합성하지 않는다', () => {
    expect(
      resolveCurrentProductMarker(
        [{date: '2026-03-02', price: 8000}],
        1,
        11000,
        null,
      ),
    ).toBeNull();
  });
});
