/**
 * 하단 입력창 화면의 키보드 회피. keyboard-controller 의 KeyboardAvoidingView 는 자기 위치를
 * 부모 기준(onLayout)으로 재서, 위에 네이티브 헤더가 있으면 그 높이만큼 덜 민다 —
 * 커뮤니티 글 댓글에서 "키보드만 올라오고" 입력창이 키보드 뒤에 묻혔다(2026-10-01 사용자).
 *
 * 소스 텍스트로 고정한다 — 화면이 네비게이션·쿼리 컨텍스트를 요구해 단독 렌더가 안 된다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

describe.each([
  'src/screens/community/CommunityPostScreen.tsx',
  'src/screens/comment/ProductCommentsScreen.tsx',
])('%s', file => {
  it('헤더 높이를 keyboardVerticalOffset 로 넘긴다', () => {
    const src = read(file);
    expect(src).toContain('useHeaderHeight()');
    expect(src).toContain('keyboardVerticalOffset={headerHeight}');
  });
});

export {};
