/**
 * 공유 버튼 접근성 이름 — web·앱 공유 시트가 같은 문구를 쓴다.
 * 예전엔 `${label}(으)로 공유` 라 VoiceOver·TalkBack 이 「카카오톡 으 로 공유」로 읽었다.
 * 채널이 몇 개 안 되는 고정 문구라 조사 라이브러리(es-hangul josa) 대신 문구를 적는다
 * (web 상세 첫 로드 JS +4.8KB gz 를 낼 일이 아니었다, 2026-10-15 실측).
 */
export {};

const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string): string =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string): string =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

describe('공유 버튼 접근성 이름', () => {
  const app = read('src/screens/detail/ui/ShareSheet.tsx');
  const web = readWeb('shared/ui/ShareSheet.tsx');

  it('「(으)로」 를 그대로 붙이지 않는다(web·앱)', () => {
    for (const src of [app, web]) {
      expect(src).not.toMatch(/\}\(으\)로/);
    }
  });

  it('같은 채널은 같은 이름', () => {
    for (const label of ['X로 공유', '스레드로 공유', '다른 앱으로 공유']) {
      expect(app).toContain(`a11y: '${label}'`);
      expect(web).toContain(`a11y: '${label}'`);
    }
    expect(app).toContain("a11y: '카카오톡으로 공유'");
    expect(app).toContain('accessibilityLabel={a11y}');
    expect(web).toContain('aria-label={a11y}');
  });
});
