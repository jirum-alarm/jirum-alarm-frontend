/**
 * 공유 버튼 접근성 이름 — web·앱 공유 시트가 같은 정본(@jirum/domain/share SHARE_CHANNEL_COPY)을 쓴다.
 * 예전엔 `${label}(으)로 공유` 라 VoiceOver·TalkBack 이 「카카오톡 으 로 공유」로 읽었다.
 */
export {};

const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string): string =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

describe('공유 버튼 접근성 이름', () => {
  const {SHARE_CHANNEL_COPY} = require('@jirum/domain/share');

  it('조사까지 적힌 문구 — 「(으)로」 를 붙이지 않는다', () => {
    expect(
      Object.values(SHARE_CHANNEL_COPY).map(
        (c: unknown) => (c as {a11y: string}).a11y,
      ),
    ).toEqual([
      '카카오톡으로 공유',
      'X로 공유',
      '스레드로 공유',
      '다른 앱으로 공유',
    ]);
  });

  it('앱 시트가 정본 문구를 화면 읽기 이름으로 건다', () => {
    const app = read('src/screens/detail/ui/ShareSheet.tsx');
    expect(app).toContain('SHARE_CHANNEL_COPY');
    expect(app).not.toMatch(/\}\(으\)로/);
    expect(app).toContain('accessibilityLabel={a11y}');
  });
});
