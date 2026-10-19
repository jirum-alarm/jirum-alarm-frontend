/**
 * className 이 붙은 요소에 함수형 style(`style={({pressed}) => …}`)을 주지 않는다.
 * NativeWind(react-native-css-interop)는 inline style 을 규칙으로 모으며 함수를 `{...fn}` 으로 펼쳐
 * 통째로 버린다 — 레이아웃이면 화면이 무너지고(상세 헤더 로고 세로 쌓임 10/1, 관심 카테고리
 * 3열 격자 붕괴 10/20), opacity 면 눌러도 티가 안 난다(37곳이 그랬다). tsc·jest 는 못 잡는다.
 *
 * 누름 효과는 `PressableOpacity`(흐려짐)·`PressableScale`(줄어듦)를 쓴다.
 */
export {};

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
declare const __dirname: string;

const SRC = path.join(__dirname, '../src');

const walk = (dir: string): string[] =>
  fs
    .readdirSync(dir, {withFileTypes: true})
    .flatMap((e: {name: string; isDirectory: () => boolean}) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return walk(p);
      return /\.tsx$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
    });

const attr = (el: any, name: string) =>
  el.attributes.properties.find((a: any) => a.name?.text === name);

it('className 과 함수형 style 을 같이 주는 요소가 없다', () => {
  const offenders: string[] = [];
  for (const file of walk(SRC)) {
    const sf = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const visit = (node: any) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const style = attr(node, 'style')?.initializer?.expression;
        if (
          attr(node, 'className') &&
          style &&
          (ts.isArrowFunction(style) || ts.isFunctionExpression(style))
        ) {
          const {line} = sf.getLineAndCharacterOfPosition(node.getStart());
          offenders.push(`${path.relative(SRC, file)}:${line + 1}`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  expect(offenders).toEqual([]);
});
