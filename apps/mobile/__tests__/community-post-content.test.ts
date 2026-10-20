export {};

/**
 * 커뮤니티 본문 마커(`:::jirum-images`) 파싱.
 *
 * 🔴 이 포맷은 **이미 올라간 글에 들어 있는 저장 형식**이다(CommentOutput 에
 * 이미지 필드가 없어 본문 문자열에 심는다). 한 글자만 어긋나도 기존 글의
 * 이미지가 본문 텍스트로 새거나 통째로 사라진다 — 그래서 여기서는
 * "함수가 있나"가 아니라 **실제 문자열을 넣고 결과를 확인**한다.
 *
 * 앱은 읽기만 하고 쓰기는 web 웹뷰가 한다. 둘 다 정본 @jirum/domain/community-post 를 쓴다.
 */

const {
  parsePostContent,
  serializePostContent,
  getPostDisplayContent,
  getPostImages,
  isAllowedPostImageUrl,
  MAX_POST_IMAGES,
} = require('../src/entities/community/post-content');

const CDN = 'https://cdn.jirum-alarm.com';

describe('마커 파싱 — 저장 포맷 그대로', () => {
  it('마커가 없는 글은 본문을 그대로 돌려준다', () => {
    expect(parsePostContent('그냥 본문')).toEqual({
      content: '그냥 본문',
      images: [],
    });
  });

  it('빈 문자열도 안전하다', () => {
    expect(parsePostContent('')).toEqual({content: '', images: []});
  });

  it('마커 블록을 떼고 이미지 URL 을 순서대로 뽑는다', () => {
    const raw = `:::jirum-images\n${CDN}/a.jpg\n${CDN}/b.jpg\n:::\n본문 텍스트`;
    expect(parsePostContent(raw)).toEqual({
      content: '본문 텍스트',
      images: [`${CDN}/a.jpg`, `${CDN}/b.jpg`],
    });
  });

  it('블록만 있고 본문이 없는 글도 처리한다', () => {
    const raw = `:::jirum-images\n${CDN}/a.jpg\n:::\n`;
    expect(parsePostContent(raw)).toEqual({
      content: '',
      images: [`${CDN}/a.jpg`],
    });
  });

  /**
   * ★블록이 **맨 앞**에 있을 때만 마커다(정규식 `^`). 본문 중간에 같은
   * 문자열이 나와도 이미지로 오인해서 본문을 잘라내면 안 된다.
   */
  it('본문 중간의 같은 문자열은 마커로 보지 않는다', () => {
    const raw = `안녕\n:::jirum-images\n${CDN}/a.jpg\n:::\n`;
    expect(parsePostContent(raw)).toEqual({content: raw, images: []});
  });

  it('CDN 이 아닌 URL 은 걸러낸다(마커 안에 있어도)', () => {
    const raw = `:::jirum-images\nhttps://evil.com/a.jpg\n${CDN}/b.jpg\n:::\n본문`;
    expect(parsePostContent(raw).images).toEqual([`${CDN}/b.jpg`]);
  });

  it('빈 줄·공백 줄은 무시한다', () => {
    const raw = `:::jirum-images\n${CDN}/a.jpg\n   \n\n:::\n본문`;
    expect(parsePostContent(raw).images).toEqual([`${CDN}/a.jpg`]);
  });

  it(`이미지는 최대 ${MAX_POST_IMAGES}장까지만 읽는다`, () => {
    const lines = Array.from({length: 8}, (_, i) => `${CDN}/${i}.jpg`);
    const raw = `:::jirum-images\n${lines.join('\n')}\n:::\n본문`;
    expect(parsePostContent(raw).images).toHaveLength(MAX_POST_IMAGES);
  });

  it('직렬화 → 파싱 왕복이 원본과 같다(바이트 호환)', () => {
    const images = [`${CDN}/a.jpg`, `${CDN}/b.jpg`];
    const serialized = serializePostContent('본문', images);
    expect(serialized).toBe(
      `:::jirum-images\n${CDN}/a.jpg\n${CDN}/b.jpg\n:::\n본문`,
    );
    expect(parsePostContent(serialized)).toEqual({content: '본문', images});
  });

  it('이미지가 없으면 마커를 붙이지 않는다', () => {
    expect(serializePostContent('본문', [])).toBe('본문');
  });

  it('보조 함수 두 개는 파서와 같은 결과를 준다', () => {
    const raw = `:::jirum-images\n${CDN}/a.jpg\n:::\n본문`;
    expect(getPostDisplayContent(raw)).toBe('본문');
    expect(getPostImages(raw)).toEqual([`${CDN}/a.jpg`]);
  });
});

describe('CDN 허용 판정', () => {
  it('https + 정확한 호스트만 허용한다', () => {
    expect(isAllowedPostImageUrl(`${CDN}/a.jpg`)).toBe(true);
    expect(isAllowedPostImageUrl(`http://cdn.jirum-alarm.com/a.jpg`)).toBe(
      false,
    );
    expect(isAllowedPostImageUrl('https://cdn.jirum-alarm.com')).toBe(true);
  });

  /** 접두사 비교의 대표적 함정. 여기서 통과하면 임의 도메인이 이미지로 뜬다. */
  it('호스트를 접두사로 흉내낸 도메인은 막는다', () => {
    expect(
      isAllowedPostImageUrl('https://cdn.jirum-alarm.com.evil.com/a.jpg'),
    ).toBe(false);
    expect(isAllowedPostImageUrl('https://cdn.jirum-alarm.community/a')).toBe(
      false,
    );
  });

  it('대소문자는 URL 처럼 무시한다', () => {
    expect(isAllowedPostImageUrl('https://CDN.JIRUM-ALARM.COM/a.jpg')).toBe(
      true,
    );
  });
});

/** web·앱이 같은 정본(@jirum/domain/community-post)을 쓴다 — web 소스 문자열 대조 대신 정본 동일성. */
describe('정본 @jirum/domain/community-post', () => {
  it('앱 파서가 정본 함수 그대로다', () => {
    const canon = require('@jirum/domain/community-post');
    expect(parsePostContent).toBe(canon.parsePostContent);
    expect(MAX_POST_IMAGES).toBe(canon.MAX_POST_IMAGES);
  });

  it('블록은 문서 맨 앞에서만 찾는다(본문 중간의 마커는 글자다)', () => {
    const raw = `본문\n:::jirum-images\n${CDN}/a.jpg\n:::\n`;
    expect(parsePostContent(raw)).toEqual({content: raw, images: []});
  });
});
