import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * 정본 가드 — 여기(@jirum/domain)에 있는 함수를 web·앱이 **다시 정의하지 않는다**.
 *
 * 전엔 같은 규칙을 두 앱이 따로 들고, 앱 테스트가 web 소스를 읽어 출력·문자열을 대조했다(chart-parity 등).
 * 그 방식은 리팩터링만 해도 깨지고(가짜 빨간불) 안 옮긴 건 못 잡았다. 이제 규칙은 이 패키지 한 곳이고,
 * 앱에 같은 이름의 정의가 다시 생기면 «복사가 시작됐다»로 보고 여기서 막는다(2026-10-20).
 *
 * 이름이 우연히 겹치는데 뜻이 다른 함수는 ALLOWED 에 «파일: 이유» 와 함께 둔다.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const APP_ROOTS = ['apps/web/src', 'apps/mobile/src'];

/** 이름은 같지만 다른 일을 하는 앱 함수. 키 = `<이름>@<레포 상대 경로>`. */
const ALLOWED: Record<string, string> = {
  // web 전용 화면의 금액 표기 — 값이 없으면 '-'(정본 won 은 숫자만 받는다)·반올림 없음 등 계약이 다르다. 앱에 짝이 없다.
  'won@apps/web/src/app/(desktop-ready)/deals/[slug]/DealsListSection.tsx': "null → '-'",
  'won@apps/web/src/app/(desktop-ready)/deals/[slug]/page.tsx': "null → '-'",
  'won@apps/web/src/features/deals/lib/model-page-insights.ts': '함수 안 지역 헬퍼(ko-KR)',
  'won@apps/web/src/features/mypage/ui/keyword/SentenceAlertBuilder.tsx': '반올림 없음(입력값 그대로)',
  'won@apps/web/src/features/product-list/ui/ClusteredPriceSection.tsx': "null → '-'",
};

const exportedFunctionNames = (): Map<string, string> => {
  const names = new Map<string, string>();
  for (const file of fs.readdirSync(here)) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
    const src = fs.readFileSync(path.join(here, file), 'utf8');
    for (const m of src.matchAll(/^export (?:async )?function (\w+)/gm)) names.set(m[1], file);
    for (const m of src.matchAll(/^export const (\w+) = (?:\([^)]*\)|\w+) =>/gm)) names.set(m[1], file);
  }
  return names;
};

const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'gql' || e.name === '__generated__') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.(test|spec|stories)\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
};

test('@jirum/domain 의 함수를 web·앱이 다시 정의하지 않는다', () => {
  const names = exportedFunctionNames();
  assert.ok(names.size > 20, `도메인 함수 수집이 비었다(${names.size}) — 정규식이 깨졌나`);
  const copies: string[] = [];
  for (const root of APP_ROOTS) {
    for (const file of walk(path.join(repo, root))) {
      const src = fs.readFileSync(file, 'utf8');
      const rel = path.relative(repo, file);
      for (const [name, origin] of names) {
        const def = new RegExp(
          `^\\s*(?:export )?(?:(?:async )?function ${name}\\b|const ${name} = (?:\\([^)]*\\)|\\w+) =>)`,
          'm',
        );
        if (def.test(src) && !ALLOWED[`${name}@${rel}`]) copies.push(`${rel} — ${name} (정본 ${origin})`);
      }
    }
  }
  assert.deepEqual(copies, [], `정본을 import 하지 않고 다시 정의했다:\n${copies.join('\n')}`);
});
