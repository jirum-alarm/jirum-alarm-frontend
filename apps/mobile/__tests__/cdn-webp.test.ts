/**
 * CDN 이미지는 webp 로 요청한다.
 *
 * 🔴`cdn.jirum-alarm.com` 은 **webp 만** 저장하는데 커뮤니티 본문 마커·썸네일은
 * 원본 확장자(.jpg/.png)를 들고 온다. 그 URL 은 **403**(S3 에 ListBucket 권한이
 * 없어 404 대신 403) 이고 `<Image>` 는 아무것도 안 그려 빈 회색 상자가 남는다.
 *
 * 실측 2026-09-09: 최근 글 32건에서 뽑은 cdn URL 29개 중 26개가 403,
 * 같은 경로의 `.webp` 는 전부 200. 시뮬레이터 로그의 403 이 3시간에 274건.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const {convertToWebp} = require('../src/shared/lib/format/image');

describe('convertToWebp — web shared/lib/utils/image.ts 와 같은 규칙', () => {
  it('jpg·jpeg·png 를 webp 로 바꾼다(대소문자 무시)', () => {
    expect(convertToWebp('https://x/a.jpg')).toBe('https://x/a.webp');
    expect(convertToWebp('https://x/a.JPEG')).toBe('https://x/a.webp');
    expect(convertToWebp('https://x/a.PNG')).toBe('https://x/a.webp');
  });

  it('쿼리는 살린다', () => {
    expect(convertToWebp('https://x/a.jpg?v=2')).toBe('https://x/a.webp?v=2');
  });

  it('★그 외는 건드리지 않는다 — 외부 썸네일(쿠팡·알리)을 깨뜨리면 안 된다', () => {
    expect(convertToWebp('https://x/a.webp')).toBe('https://x/a.webp');
    expect(convertToWebp('https://x/a.gif')).toBe('https://x/a.gif');
    expect(convertToWebp('https://x/a')).toBe('https://x/a');
    // 경로 중간의 확장자는 끝이 아니므로 그대로.
    expect(convertToWebp('https://x/a.jpg/b')).toBe('https://x/a.jpg/b');
  });

  it('빈 값은 undefined', () => {
    expect(convertToWebp(undefined)).toBeUndefined();
    expect(convertToWebp(null)).toBeUndefined();
    expect(convertToWebp('')).toBeUndefined();
  });

  it('web 과 정규식이 같다', () => {
    const web = fs.readFileSync(
      path.join(__dirname, '../../web/src/shared/lib/utils/image.ts'),
      'utf8',
    );
    const pattern = /\/\\\.\(jpg\|jpeg\|png\)\(\\\?\.\*\)\?\$\/i/;
    expect(web).toMatch(pattern);
    expect(read('src/shared/lib/format/image.ts')).toMatch(pattern);
  });
});

describe('★원격 이미지를 그리는 곳은 변환을 거친다', () => {
  it('Thumbnail 은 webp 먼저, 실패하면 원본, 그다음 대체 그림', () => {
    // 변환만 하고 폴백이 없으면 webp 가 아닌 외부 이미지를 깨뜨린다.
    const src = read('src/shared/components/product/Thumbnail.tsx');
    expect(src).toContain('convertToWebp');
    expect(src).toContain('[webp, uri]');
    expect(src).toContain('onError');
  });

  it('커뮤니티 본문 첨부도 변환한다 — Image.getSize 도 같은 URL 을 재야 한다', () => {
    const src = read('src/features/community/ui/PostImages.tsx');
    expect(src).toContain('convertToWebp');
  });

  it('★원격 uri 를 직접 RN <Image> 에 넣는 곳이 남아 있지 않다', () => {
    // 직접 넣으면 변환도 폴백도 없어 빈 회색 상자가 된다.
    // ⚠️`react-native-webview` 의 `source={{uri}}` 는 대상이 아니다 — 이미지가
    // 아니라 페이지다. 그래서 `<Image` 태그 바로 뒤의 source 만 본다.
    const {execSync} = require('child_process');
    const files: string[] = execSync('ls src', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .flatMap((dir: string) =>
        execSync(`find src/${dir} -name '*.tsx' || true`, {
          cwd: path.join(__dirname, '..'),
          encoding: 'utf8',
        })
          .split('\n')
          .filter(Boolean),
      );

    const offenders: string[] = [];
    for (const file of files) {
      const lines = read(file).split('\n');
      lines.forEach((line: string, i: number) => {
        if (!/<Image\b/.test(line)) return;
        // 태그 시작 후 4줄 안의 source 만 본다(그 안에 반드시 있다).
        const window = lines.slice(i, i + 5).join('\n');
        if (/source=\{\{\s*uri/.test(window)) offenders.push(file);
      });
    }

    // 허용: 변환·폴백을 스스로 하는 곳, 로컬/외부 전용 이미지.
    const allowed = new Set([
      'src/shared/components/product/Thumbnail.tsx',
      'src/features/community/ui/PostImages.tsx',
      // 토스·배너·상세 본문은 cdn.jirum-alarm.com 이 아니라 외부 원본이다.
      'src/screens/detail/ui/TossDetailImages.tsx',
      'src/screens/detail/ProductDetailScreen.tsx',
      'src/screens/detail/ui/ShareSheet.tsx',
      'src/entities/home/ui/HomeBannerCarousel.tsx',
      'src/entities/home/ui/cards/TossDealCard.tsx',
    ]);
    expect([...new Set(offenders)].filter(f => !allowed.has(f))).toEqual([]);
  });
});

export {};
