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
export {};
