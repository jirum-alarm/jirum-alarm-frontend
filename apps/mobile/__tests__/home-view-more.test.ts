const fs = require('fs');
const path = require('path');
declare const __dirname: string;
const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

describe('더보기 링크 — web 에 있으면 앱에도 있어야', () => {
  it('일반 섹션(DynamicProductSection)', () => {
    expect(readWeb('widgets/home/ui/DynamicProductSection.tsx')).toContain(
      'InteractiveMoreLink',
    );
    expect(read('src/entities/home/ui/DynamicProductSection.tsx')).toContain(
      '더보기',
    );
  });

  it('★토스 특가 — web 은 /toss?tab={activeId}', () => {
    const web = readWeb('widgets/home/ui/TossHomeSection.tsx');
    expect(web).toContain('/toss?tab=');
    const native = read('src/entities/home/ui/TossHomeSection.tsx');
    expect(native).toContain('/toss?tab=');
    expect(native).toContain('더보기');
  });

  it('★랭킹 — 제목 + 더보기 헤더가 앱에도 있다', () => {
    // 슬라이더만 옮기고 web JirumRankingContainer 의 헤더를 빠뜨렸었다.
    const web = readWeb('widgets/home/ui/mobile/JirumRankingContainer.tsx');
    expect(web).toContain('InteractiveMoreLink');
    expect(web).toContain('지름알림 랭킹');
    const home = read('src/screens/home/HomeScreen.tsx');
    expect(home).toContain('지름알림 랭킹');
    expect(home).toContain('/trending/ranking');
  });
});

describe('더보기 눌림 인터랙션 — web InteractiveMoreLink(whileTap 0.95) 대응', () => {
  // 3곳 전부 PressableScale 이어야 한다. "같은 패턴을 한 곳만" 재발 방지
  // (native-port-omissions-user-caught — 이 세션에서 4번 재발한 패턴).
  it.each([
    'src/entities/home/ui/DynamicProductSection.tsx',
    'src/entities/home/ui/TossHomeSection.tsx',
    'src/screens/home/HomeScreen.tsx',
  ])('%s 의 더보기는 PressableScale', file => {
    const src = read(file);
    // 더보기 텍스트를 감싸는 컴포넌트가 PressableScale 인지 — 더보기 <Text> 앞
    // 최근접 여는 태그를 찾는다.
    const idx = src.indexOf('>더보기<');
    expect(idx).toBeGreaterThan(-1);
    const before = src.slice(0, idx);
    const lastScale = before.lastIndexOf('<PressableScale');
    const lastPressable = before.lastIndexOf('<Pressable ');
    expect(lastScale).toBeGreaterThan(lastPressable);
  });
});

describe('pull-to-refresh — 네이티브 목록 화면 전부', () => {
  it('홈은 RefreshControl 사용', () => {
    expect(read('src/screens/home/HomeScreen.tsx')).toContain('RefreshControl');
  });

  it('큐레이션·토스 그리드(CurationGrid)도 RefreshControl 사용', () => {
    const grid = read('src/entities/home/ui/CurationGrid.tsx');
    expect(grid).toContain('RefreshControl');
    expect(grid).toContain('refreshControl=');
  });
});
export {};
