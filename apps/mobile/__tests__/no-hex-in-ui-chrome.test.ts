/**
 * 앱 화면 코드에 hex 색을 직접 적지 않는다 — 린트(@jirum/design-system/eslint)는 className 만 보고,
 * JS 값으로 넘기는 색(color=·fill=·StyleSheet)은 못 본다. 그 자리의 hex 는 다크에서 안 뒤집혀
 * 「다크 웹뷰 로딩 때 흰 화면 번쩍」「다크 인앱 브라우저의 흰 툴바」 같은 버그가 됐다(2026-10-16 정리).
 *
 * 색은 `useColors()`(테마 따라), 테마 무관이면 `fixed`·`light.error[500]`·`brand.kakao`
 * (import {fixed, light, brand} from '@jirum/design-system'), 차트는 `chartColor(role, colors)`.
 */
export {};

const fs = require('fs');
const path = require('path');
declare const __dirname: string;

const SRC = path.join(__dirname, '../src');

/** 의도된 고정색 — 그림 자체의 색이라 테마와 무관하다. 늘릴 땐 이유를 적는다. */
const ALLOWED: {match: RegExp; why: string}[] = [
  {
    match: /^shared\/components\/icons\//,
    why: '아이콘·로고·일러스트 SVG 그림 색',
  },
  {match: /Icon\.tsx$/, why: '아이콘 SVG 그림 색'},
  {
    match: /^shared\/components\/product\/HotdealBadge\.tsx$/,
    why: '핫딜 배지 그라데이션 그림(web 과 같은 정지점)',
  },
];

const HEX = /['"]#[0-9a-fA-F]{3,8}['"]/;

const walk = (dir: string): string[] =>
  fs
    .readdirSync(dir, {withFileTypes: true})
    .flatMap((e: {name: string; isDirectory: () => boolean}) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return walk(p);
      return /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
    });

describe('앱 UI 코드에 hex 색 리터럴이 없다', () => {
  it('허용 목록(그림) 밖 파일은 토큰으로 색을 쓴다', () => {
    const offenders = walk(SRC)
      .map(p => path.relative(SRC, p).split(path.sep).join('/'))
      .filter(rel => !ALLOWED.some(a => a.match.test(rel)))
      .flatMap(rel =>
        fs
          .readFileSync(path.join(SRC, rel), 'utf8')
          .split('\n')
          .map((line: string, i: number): [string, number] => [line, i])
          // 주석 안의 hex(설명·이력)는 색으로 쓰이지 않는다.
          .filter(
            ([line]: [string, number]) =>
              HEX.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line),
          )
          .map(
            ([line, i]: [string, number]) => `${rel}:${i + 1}  ${line.trim()}`,
          ),
      );
    expect(offenders).toEqual([]);
  });
});
