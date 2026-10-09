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
      'onPressMore',
    );
  });

  it('★토스 특가 — web 은 /toss?tab={activeId}', () => {
    const web = readWeb('widgets/home/ui/TossHomeSection.tsx');
    expect(web).toContain('/toss?tab=');
    const native = read('src/entities/home/ui/TossHomeSection.tsx');
    expect(native).toContain('/toss?tab=');
    expect(native).toMatch(/<SectionHeader[\s\S]*?onPressMore/);
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
  // 예전엔 3곳이 더보기를 따로 그려 "같은 패턴을 한 곳만" 고치는 일이 났다
  // (native-port-omissions-user-caught). 이제 공용 SectionHeader 한 곳이 그리고, 3곳은 그걸 쓴다.
  it('공용 SectionHeader 의 더보기는 PressableScale', () => {
    const src = read('src/shared/components/ui/SectionHeader/index.tsx');
    // 더보기 <Text> 앞 최근접 여는 태그가 PressableScale 인지.
    const idx = src.indexOf('>더보기<');
    expect(idx).toBeGreaterThan(-1);
    const before = src.slice(0, idx);
    expect(before.lastIndexOf('<PressableScale')).toBeGreaterThan(
      before.lastIndexOf('<Pressable '),
    );
  });

  it.each([
    'src/entities/home/ui/DynamicProductSection.tsx',
    'src/entities/home/ui/TossHomeSection.tsx',
    'src/screens/home/HomeScreen.tsx',
  ])('%s 는 더보기를 직접 그리지 않고 SectionHeader 에 맡긴다', file => {
    const src = read(file);
    expect(src).toMatch(/<SectionHeader[\s\S]*?onPressMore/);
    expect(src).not.toContain('>더보기<');
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
