/**
 * 홈 상단바 색 전환.
 *
 * web 은 흰 헤더를 위에서 slide-in 시키지만(`-translate-y-full`), 네이티브에선
 * 그게 어색했다(사용자 지적) — 헤더는 제자리에 두고 **색만 크로스페이드**한다.
 * 단순 배경색 토글도 어색하다(한 프레임에 뚝 바뀜) — 그 사이가 정답.
 *
 * 컴포넌트를 렌더하면 네비게이션·safe-area 의존이 딸려오므로 소스 텍스트로 검사한다
 * (frontend-test-runner-dayjs-esm-gap 와 같은 이유).
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const header = read('src/screens/home/ui/HomeHeader.tsx');
const screen = read('src/screens/home/HomeScreen.tsx');

describe('로고 탭', () => {
  it('로고가 눌린다 — 맨 위로 스크롤', () => {
    // web 은 로고가 `/` 링크라 홈에선 맨 위로 가는 체감이다.
    expect(header).toContain('onPressLogo');
    expect(header).toContain('accessibilityLabel="지름알림 홈, 맨 위로"');
  });

  it('두 겹 모두에 전달된다(투명한 겹도 눌려야)', () => {
    expect(header).toContain(
      '<HeaderRow inverted onPressLogo={onPressLogo} />',
    );
    expect(header).toContain(
      '<HeaderRow inverted={false} onPressLogo={onPressLogo} />',
    );
  });

  it('홈이 ScrollView ref 로 맨 위로 보낸다', () => {
    expect(screen).toContain('scrollRef');
    expect(screen).toContain('scrollTo({y: 0, animated: true})');
    expect(screen).toContain('onPressLogo={scrollToTop}');
  });
});

describe('상단바 전환 — web 과 같은 방식', () => {
  it('전환 시간은 web 과 같은 300ms', () => {
    const web = readWeb('widgets/home/ui/mobile/HomeHeader.tsx');
    expect(web).toContain('duration-300');
    expect(header).toContain('TRANSITION_MS = 300');
  });

  it('★슬라이드가 아니라 색만 바뀐다 — translateY 를 쓰지 않는다', () => {
    // web 의 -translate-y-full 을 그대로 옮겼더니 어색했다.
    expect(header).not.toContain('translateY');
  });

  it('opacity 크로스페이드로 색을 넘긴다', () => {
    expect(header).toContain('opacity: progress');
  });

  it('두 겹을 쌓는다 — 다크 위에 흰 헤더', () => {
    expect(header).toContain('bg-gray-900');
    expect(header).toContain('bg-white');
  });

  it('opacity 만 쓰므로 네이티브 드라이버로 돈다', () => {
    // JS 드라이버면 스크롤 중 프레임이 튄다.
    expect(header).toContain('useNativeDriver: true');
  });

  it('스크롤 임계값이 web 과 같은 90px', () => {
    const web = readWeb('widgets/home/ui/mobile/HomeHeader.tsx');
    expect(web).toContain('scrollThreshold = 90');
    expect(screen).toContain('y > 90');
  });

  it('상태바는 전환 중간에 바꾼다', () => {
    // 즉시 바꾸면 다크 헤더에 검은 글씨, 끝나고 바꾸면 흰 헤더에 흰 글씨가 된다.
    expect(screen).toContain('statusBarStyle');
    expect(screen).toMatch(/setTimeout\([\s\S]{0,120}150,/);
  });
});

// 이 파일을 모듈로 만든다 — 안 하면 최상위 const 가 다른 테스트와
// 같은 전역 스코프를 공유해 tsc 가 재선언으로 잡는다(jest 런타임은 무관).
export {};
