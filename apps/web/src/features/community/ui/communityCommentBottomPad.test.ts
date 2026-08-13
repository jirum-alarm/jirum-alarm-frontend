import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const COMMENT = readFileSync(new URL('./CommunityCommentSection.tsx', import.meta.url), 'utf8');
const CSS = readFileSync(new URL('../../../shared/style/globals.css', import.meta.url), 'utf8');

describe('커뮤니티 게시글 상세 하단 댓글 여백', () => {
  it('입력창 bottom 은 보이는 내비 높이만 쓴다', () => {
    assert.match(COMMENT, /bottom-\[var\(--bottom-nav-padding,0px\)\]/);
  });

  it('입력창 padding-bottom 은 chrome 변수를 쓴다 — safe-area 와 내비 높이를 겹치지 않게', () => {
    assert.match(COMMENT, /pb-\[var\(--bottom-chrome-padding\)\]/);
    assert.doesNotMatch(
      COMMENT,
      /pb-\[max\(0\.75rem,env\(safe-area-inset-bottom\)\)\]/,
      'safe-area 를 입력창에 직접 넣으면 탭바/내비가 있을 때 아래에 빈 여백이 생긴다',
    );
  });

  it('앱 native-tabs 에 탭바 높이를 CSS 로 박지 않는다 — 숨긴 상세에도 여백이 남는다', () => {
    assert.doesNotMatch(CSS, /html\[data-native-tabs='true'\]\s*\{[^}]*--bottom-nav-padding/);
  });

  it('웹 내비가 없으면 chrome 이 home indicator 를 맡고, 있으면 0.75rem 만', () => {
    assert.match(
      CSS,
      /--bottom-chrome-padding:\s*max\(0\.75rem,\s*env\(safe-area-inset-bottom\)\)/,
    );
    assert.match(CSS, /html\[data-bottom-nav='true'\][\s\S]*?--bottom-chrome-padding:\s*0\.75rem/);
  });
});

const LIST = readFileSync(new URL('./CommunityList.tsx', import.meta.url), 'utf8');

describe('커뮤니티 글쓰기 FAB', () => {
  it('앱 탭바 캡슐 높이(--bottom-fab-padding) 위에 붙는다 — 목록 여백을 쓰면 뜬다', () => {
    assert.match(LIST, /--bottom-fab-padding/);
    assert.match(LIST, /--bottom-fab-gap/);
  });
});
