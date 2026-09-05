import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

// 훅은 react/jotai 의존이라 bare node --test 로 import 할 수 없다(apps/web 러너 제약).
// 회귀의 핵심인 "경로 변경 시 기준점" 계약을 소스 텍스트로 고정한다.
const SOURCE = readFileSync(new URL('./useScrollDirection.ts', import.meta.url), 'utf8');

describe('스크롤 방향 기준점 리셋', () => {
  it('경로 변경 시 lastScrollY 를 0 으로 박지 않는다', () => {
    // 뒤로가기는 브라우저가 스크롤을 복원한다. 0 으로 가정하면 복원값과 비교해
    // 'down' 으로 오판정 → 헤더·바텀네비가 숨었다 나타나며 흔들린다.
    assert.doesNotMatch(SOURCE, /lastScrollY\.current = 0;/);
    assert.match(SOURCE, /lastScrollY\.current =[^;]*window\.scrollY/);
  });

  it('SSR 에서 window 접근으로 죽지 않는다', () => {
    assert.match(SOURCE, /typeof window === 'undefined'/);
  });
});

// 방향 판정 로직 재현 — 소스와 같은 규칙을 손으로 옮겨 실패 시나리오를 고정한다.
function decideDirection({
  scrollY,
  lastScrollY,
  clientHeight,
  scrollHeight,
  prev,
}: {
  scrollY: number;
  lastScrollY: number;
  clientHeight: number;
  scrollHeight: number;
  prev: 'up' | 'down' | null;
}) {
  const THRESHOLD = 10;
  if (Math.abs(scrollY - lastScrollY) < THRESHOLD) return prev;
  if (scrollY < THRESHOLD || scrollY + clientHeight >= scrollHeight - THRESHOLD) return 'up';
  return scrollY > lastScrollY ? 'down' : 'up';
}

describe('방향 판정', () => {
  const page = { clientHeight: 800, scrollHeight: 10000 };

  it('뒤로가기 복원 직후 정지 상태를 down 으로 읽지 않는다 — 이번 회귀', () => {
    // 스크롤 2000 에서 뒤로 돌아옴. 기준점이 실제 위치(2000)면 움직임 없음 = 유지.
    const kept = decideDirection({ scrollY: 2000, lastScrollY: 2000, ...page, prev: 'up' });
    assert.equal(kept, 'up', '복원 직후 헤더가 숨으면 안 된다');

    // 버그 재현: 기준점을 0 으로 박았을 때
    const buggy = decideDirection({ scrollY: 2000, lastScrollY: 0, ...page, prev: 'up' });
    assert.equal(buggy, 'down', '0 기준이면 down 으로 오판정한다(이래서 흔들렸다)');
  });

  it('실제로 내리면 down, 올리면 up', () => {
    assert.equal(
      decideDirection({ scrollY: 2200, lastScrollY: 2000, ...page, prev: 'up' }),
      'down',
    );
    assert.equal(
      decideDirection({ scrollY: 1800, lastScrollY: 2000, ...page, prev: 'down' }),
      'up',
    );
  });

  it('상단·바닥 근처는 항상 노출', () => {
    assert.equal(decideDirection({ scrollY: 2, lastScrollY: 500, ...page, prev: 'down' }), 'up');
    assert.equal(decideDirection({ scrollY: 9200, lastScrollY: 8000, ...page, prev: 'up' }), 'up');
  });

  it('임계값 미만 흔들림은 방향을 바꾸지 않는다', () => {
    assert.equal(decideDirection({ scrollY: 2005, lastScrollY: 2000, ...page, prev: 'up' }), 'up');
  });
});
