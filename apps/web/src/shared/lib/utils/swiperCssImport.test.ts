import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

// <Swiper> 를 그리는 파일은 swiper/css 를 직접 싣는다. 2026-10-15 carousel barrel 에서 swiper 재export 를 빼자
// 그 barrel 덕에 CSS 를 얻어 쓰던 랭킹·실시간 탭이 가로 flex 를 잃고, 「전체」 말고 모든 탭이 화면 밖으로 밀려 빈 화면이 됐다.
const SRC_ROOT = new URL('../../../', import.meta.url).pathname;

function listTsx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listTsx(path);
    return path.endsWith('.tsx') ? [path] : [];
  });
}

describe('swiper/css 직접 import', () => {
  it('<Swiper> 를 그리는 파일은 모두 swiper/css 를 import 한다', () => {
    const missing = listTsx(SRC_ROOT).filter((file) => {
      const source = readFileSync(file, 'utf8');
      return /<Swiper[\s>]/.test(source) && !source.includes("import 'swiper/css'");
    });
    assert.deepEqual(missing, []);
  });
});
