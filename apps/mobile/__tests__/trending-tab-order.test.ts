/**
 * 발견 탭 카테고리 칩 순서 — web widgets/trending/lib/tabOrder.ts 와 같아야 한다.
 */
// @types/node 가 없어 import 대신 인라인 require(ranking-card-parity 와 같은 방식).
const fs = require('fs');
const path = require('path');
declare const __dirname: string;

import {orderTrendingCategories} from '../src/screens/trending/trending-tab-order';

const ids = (list: {id: number}[]): number[] => list.map(c => c.id);

describe('orderTrendingCategories', () => {
  it('서버 id 순서를 칩 순서로 바꾸고 기타는 끝에 둔다', () => {
    const server: {id: number}[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
      id => ({id}),
    );
    expect(ids(orderTrendingCategories(server))).toEqual([
      1, 9, 2, 4, 6, 3, 10, 8, 7, 5, 11,
    ]);
  });

  it('관심 카테고리만 오면 그 안에서 같은 순서', () => {
    const server: {id: number}[] = [{id: 3}, {id: 9}, {id: 11}, {id: 10}];
    expect(ids(orderTrendingCategories(server))).toEqual([9, 3, 10, 11]);
  });

  it('모르는 새 카테고리는 아는 것 뒤·기타 앞', () => {
    const server: {id: number}[] = [{id: 11}, {id: 12}, {id: 5}];
    expect(ids(orderTrendingCategories(server))).toEqual([5, 12, 11]);
  });

  it('web 과 순서 배열이 같다', () => {
    const order = (file: string): string | undefined =>
      fs
        .readFileSync(path.join(__dirname, file), 'utf8')
        .match(/const TAB_ORDER = (\[[^\]]*\])/)?.[1];
    expect(order('../src/screens/trending/trending-tab-order.ts')).toBe(
      order('../../web/src/widgets/trending/lib/tabOrder.ts'),
    );
  });
});
