export {};

/**
 * 커뮤니티 **쓰기 흐름 6개**의 계약.
 *
 * ★정적 게이트(tsc·lint)는 "안 옮긴 것"을 못 잡는다 — 그래서 여기서는
 * ① 낙관적 업데이트·신고 변수 조립을 **실제로 실행**하고,
 * ② 각 흐름이 화면에 배선돼 있는지(뮤테이션·무효화·토스트) 소스로 확인한다.
 *
 * 6개 흐름: 댓글 작성 · 댓글 수정 · 댓글 삭제 · 댓글 좋아요 ·
 *          글 추천 · 글 신고 / 글 삭제 (글 작성·수정은 web 웹뷰)
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const {
  applyPostLike,
  applyCommentLike,
  removeCommentById,
} = require('../src/features/community/model/optimistic');
const {
  buildReportVariables,
  REPORT_REASONS,
} = require('../src/features/community/lib/report');

const commentsViewModel = read(
  'src/features/community/model/useCommunityCommentsViewModel.ts',
);
const postViewModel = read(
  'src/features/community/model/useCommunityPostViewModel.ts',
);
const postMenu = read('src/features/community/ui/PostMenu.tsx');
const reportSheet = read('src/features/community/ui/ReportSheet.tsx');
const postScreen = read('src/screens/community/CommunityPostScreen.tsx');
const writeScreen = read('src/screens/community/CommunityWriteScreen.tsx');

describe('글 추천 — 낙관적 업데이트', () => {
  const post = {isMyLike: false, likeCount: 3};

  it('추천하면 +1 · 눌린 상태가 된다', () => {
    expect(applyPostLike(post, true)).toEqual({isMyLike: true, likeCount: 4});
  });

  /**
   * ★서버 인자 규약: 취소는 `isLike` 를 **아예 보내지 않는다**(undefined).
   * `false` 를 보내면 "싫어요"가 되므로 web 과 같은 규약을 지켜야 한다.
   */
  it('취소(undefined)면 -1 · 눌림이 풀린다', () => {
    expect(applyPostLike({isMyLike: true, likeCount: 4}, undefined)).toEqual({
      isMyLike: false,
      likeCount: 3,
    });
  });

  it('다른 필드는 그대로 남는다', () => {
    expect(applyPostLike({...post, title: '제목'}, true)).toMatchObject({
      title: '제목',
    });
  });

  it('화면이 web 과 같은 인자로 부른다(취소는 undefined)', () => {
    expect(postScreen).toMatch(
      /likePost\(post\.isMyLike \? undefined : true\)/,
    );
  });

  it('실패하면 이전 값으로 되돌린다(롤백)', () => {
    expect(postViewModel).toMatch(/onError/);
    expect(postViewModel).toMatch(
      /setQueryData\(queryKey, context\.previous\)/,
    );
  });

  it('목록의 추천 수도 같이 맞춘다', () => {
    expect(postViewModel).toMatch(/onSettled/);
    expect(postViewModel).toMatch(
      /invalidateQueries\(\{\s*queryKey:\s*CommunityQueries\.keys\.all/,
    );
  });
});

describe('댓글 좋아요 — 토글', () => {
  const comments = [
    {id: '1', isMyLike: false, likeCount: 0},
    {id: '2', isMyLike: true, likeCount: 5},
  ];

  it('안 눌린 댓글을 누르면 +1', () => {
    expect(applyCommentLike(comments, 1, false)[0]).toEqual({
      id: '1',
      isMyLike: true,
      likeCount: 1,
    });
  });

  it('눌린 댓글을 누르면 -1', () => {
    expect(applyCommentLike(comments, 2, true)[1]).toEqual({
      id: '2',
      isMyLike: false,
      likeCount: 4,
    });
  });

  /**
   * ★서버 id 는 문자열(ID)인데 뮤테이션 인자는 Int 라 호출부가 Number 로
   * 바꾼다. `===` 로 비교하면 아무 것도 안 맞아 **조용히 아무 일도 안 일어난다.**
   */
  it('문자열 id 와 숫자 id 를 같은 것으로 본다', () => {
    expect(applyCommentLike(comments, '1', false)[0].isMyLike).toBe(true);
    expect(applyCommentLike(comments, 1, false)[0].isMyLike).toBe(true);
  });

  it('대상이 아닌 댓글은 건드리지 않는다', () => {
    expect(applyCommentLike(comments, 1, false)[1]).toBe(comments[1]);
  });

  it('취소는 isLike 를 보내지 않는다(web 규약)', () => {
    expect(commentsViewModel).toMatch(/isLike: isMyLike \? undefined : true/);
  });
});

describe('댓글 삭제·수정·작성', () => {
  it('삭제는 목록에서 그 댓글만 뺀다', () => {
    const list = [{id: '1'}, {id: '2'}];
    expect(removeCommentById(list, 2)).toEqual([{id: '1'}]);
  });

  it('삭제 실패는 롤백 + 토스트', () => {
    expect(commentsViewModel).toMatch(/removeComment/);
    expect(commentsViewModel).toMatch(/rollback\(context\)/);
    expect(commentsViewModel).toMatch(/삭제에 실패했어요/);
  });

  it('삭제 성공 토스트 문구가 web 과 같다', () => {
    const web = readWeb('features/community/ui/CommunityCommentSection.tsx');
    expect(web).toContain('댓글이 삭제되었어요.');
    expect(commentsViewModel).toContain('댓글이 삭제되었어요.');
  });

  it('수정은 기존 UpdateComment 뮤테이션을 쓴다(문서를 새로 안 만든다)', () => {
    expect(commentsViewModel).toMatch(/CommentService\.updateComment/);
  });

  it('작성 후에는 댓글 수(replyCount)까지 맞춘다', () => {
    // 목록 카드의 댓글 수는 다른 쿼리가 들고 있어서, 댓글 목록만
    // 무효화하면 카드 숫자가 그대로 남는다.
    expect(commentsViewModel).toMatch(
      /addComment[\s\S]{0,400}CommunityQueries\.keys\.all/,
    );
  });

  it('작성 화면은 입력창을 비운다(중복 등록 방지)', () => {
    const input = read('src/features/community/ui/CommunityCommentInput.tsx');
    expect(input).toMatch(/onSubmit\(content\);\s*\n\s*setValue\(''\)/);
  });
});

describe('글 신고', () => {
  it('대상은 댓글(COMMENT)이다 — 커뮤니티 글이 댓글 테이블의 루트 행이다', () => {
    expect(
      buildReportVariables({postId: 7, reason: 'SPAM', description: ''}),
    ).toEqual({
      target: 'COMMENT',
      targetId: 7,
      reason: 'SPAM',
      description: undefined,
    });
  });

  /** ★'기타' 가 아니면 입력값을 보내지 않는다(web 과 같다). */
  it("사유가 '기타' 일 때만 상세 설명을 보낸다", () => {
    expect(
      buildReportVariables({postId: 7, reason: 'OTHER', description: '사유'})
        .description,
    ).toBe('사유');
    expect(
      buildReportVariables({postId: 7, reason: 'ABUSE', description: '사유'})
        .description,
    ).toBeUndefined();
  });

  it("'기타' 인데 비어 있으면 아예 안 보낸다(서버가 빈 문자열을 받지 않게)", () => {
    expect(
      buildReportVariables({postId: 7, reason: 'OTHER', description: '   '})
        .description,
    ).toBeUndefined();
  });

  it('사유 목록·문구·순서가 web ReportModal 과 같다', () => {
    const web = readWeb('features/community/ui/ReportModal.tsx');
    const webLabels = [...web.matchAll(/label: '([^']+)'/g)].map(m => m[1]);
    expect(REPORT_REASONS.map((r: {label: string}) => r.label)).toEqual(
      webLabels,
    );
  });

  it('사유를 고르지 않으면 신고 버튼이 비활성이다', () => {
    expect(reportSheet).toMatch(/disabled=\{!reason \|\| isPending\}/);
  });
});

describe('글 삭제', () => {
  it('확인 시트를 지나야 삭제된다(바로 지우지 않는다)', () => {
    expect(postMenu).toMatch(/ConfirmSheet/);
    expect(postMenu).toContain('글을 삭제할까요?');
  });

  it('성공하면 커뮤니티 캐시를 통째로 버리고 목록으로 나간다', () => {
    expect(postMenu).toMatch(/CommunityQueries\.keys\.all/);
    expect(postMenu).toContain('게시글이 삭제되었어요.');
    expect(postScreen).toMatch(/onDeleted=\{\(\) => navigation\.goBack\(\)\}/);
  });
});

describe('글 작성·수정 — web 웹뷰로 간다', () => {
  it('StackWebView 로 web /community/write 를 띄운다', () => {
    expect(writeScreen).toMatch(/StackWebView/);
    expect(writeScreen).toContain("'/community/write'");
  });

  it('수정은 web 규약대로 ?edit=<id> 쿼리로 넘긴다', () => {
    expect(writeScreen).toMatch(/\/community\/write\?edit=\$\{postId\}/);
    const webWritePage = fs.readFileSync(
      path.join(
        __dirname,
        '../../web/src/app/(desktop-ready)/community/write/page.tsx',
      ),
      'utf8',
    );
    expect(webWritePage).toMatch(/searchParams[\s\S]{0,200}edit/);
  });

  it('상세의 "글 수정하기" 는 postId 를 실어 이 화면으로 보낸다', () => {
    expect(postScreen).toMatch(
      /COMMUNITY_WRITE,\s*\{postId\}|COMMUNITY_WRITE, \{postId\}/,
    );
  });

  /**
   * ★웹뷰가 하던 캐시 무효화를 네이티브가 인수한다.
   * web 은 글을 올린 뒤 자기 react-query 캐시를 무효화하는데, 그 캐시는
   * 웹뷰 안에만 있다 — 네이티브 목록은 옛 데이터를 그대로 들고 있다.
   */
  it('화면을 떠날 때 커뮤니티 캐시를 무효화한다(올린 글이 목록에 보이도록)', () => {
    expect(writeScreen).toMatch(
      /return \(\) => \{[\s\S]{0,200}invalidateQueries\([\s\S]{0,120}CommunityQueries\.keys\.all/,
    );
  });

  /**
   * 🔴🔴 주입과 가드는 짝이다. 웹이 올리는 PRESS_BACKBUTTON 을 화면이
   * 가로채지 않으면 전역 EventBridge.pressBackButton 이 받아
   * `BackHandler.exitApp()` = **앱이 종료**된다.
   * StackWebView 가 그 처리를 갖고 있는지 여기서 못박는다(그 파일이 바뀌면 깨진다).
   */
  it('웹뷰가 PRESS_BACKBUTTON 을 가로채 goBack 한다(앱 종료 방지)', () => {
    const stackWebView = read(
      'src/screens/detail/ProductDetailWebViewScreen.tsx',
    );
    expect(stackWebView).toMatch(
      /parsed\.type === WebViewEventType\.PRESS_BACKBUTTON[\s\S]{0,120}navigation\.goBack\(\)[\s\S]{0,40}return;/,
    );
    // 주입도 같이 있어야 web 이 그 브릿지 경로를 탄다(없으면 웹뷰 안에 홈이 그려진다).
    expect(stackWebView).toMatch(/NATIVE_STACK_SCRIPT/);
  });
});
