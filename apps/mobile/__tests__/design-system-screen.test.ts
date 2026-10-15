/**
 * 앱 부품 놀이터(screens/design-system) — 카탈로그(@jirum/design-system/catalog)의 앱 부품이 전부 데모를 갖고,
 * 딥링크 `/design-system` 이 그 화면으로 간다. 부품을 카탈로그에 올리고 놀이터 데모를 빼먹으면 여기서 막힌다.
 */
import {catalog} from '@jirum/design-system/catalog';

import {
  tabNavigations,
  tabStackNavigations,
} from '../src/shared/constant/navigations';
import {resolveNativeRoute} from '../src/shared/lib/navigation/tab-routing';

const fs = require('fs');
const path = require('path');
declare const __dirname: string;

const screen: string = fs.readFileSync(
  path.join(__dirname, '../src/screens/design-system/DesignSystemScreen.tsx'),
  'utf8',
);
const demosStart = screen.indexOf('export const DEMOS');
const demosBlock = screen.slice(demosStart, screen.indexOf('};', demosStart));
const demoIds = [...demosBlock.matchAll(/^\s{2}(\w+):/gm)].map(m => m[1]);

describe('앱 부품 놀이터', () => {
  it('카탈로그의 앱 부품마다 데모가 있다', () => {
    const appIds = catalog.filter(e => e.app).map(e => e.id);
    expect(appIds.filter(id => !demoIds.includes(id))).toEqual([]);
  });

  it('데모는 카탈로그에 있는 부품만(이름이 어긋나면 화면에 안 나온다)', () => {
    const ids = catalog.map(e => e.id);
    expect(demoIds.filter(id => !ids.includes(id))).toEqual([]);
  });

  it('딥링크 /design-system 은 내정보 탭 위 놀이터 화면으로 연다', () => {
    expect(resolveNativeRoute('/design-system')).toEqual({
      tab: tabNavigations.MYPAGE,
      screen: tabStackNavigations.DESIGN_SYSTEM,
    });
  });
});
