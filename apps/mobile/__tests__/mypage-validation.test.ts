export {};

/**
 * 내정보 입력 규칙 — web 과 **같은 판정**인지 실행해서 확인한다.
 *
 * web 은 이 규칙들이 뷰모델 훅 안에 박혀 있어 소스텍스트로만 대조할 수 있었다.
 * 앱은 순수 함수로 떼어냈으므로 실제로 돌려본다(런북: "판정 로직만 순수 함수로
 * 떼어 실행하라").
 */

const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const {
  countChars,
  isValidKeyword,
  isValidNickname,
  validatePassword,
} = require('../src/features/mypage/lib/validation');
const {
  CATEGORIES,
  MAX_SELECTION_COUNT,
} = require('../src/features/mypage/lib/categories');
const {
  buildBirthYearOptions,
} = require('../src/features/mypage/lib/birth-year');

describe('닉네임 — web useNicknameFormViewModel(2~12자, 공백 불가)', () => {
  it('2자 미만·12자 초과는 거절', () => {
    expect(isValidNickname('가')).toBe(false);
    expect(isValidNickname('가나')).toBe(true);
    expect(isValidNickname('가'.repeat(12))).toBe(true);
    expect(isValidNickname('가'.repeat(13))).toBe(false);
  });

  it('공백이 하나라도 있으면 거절(길이가 맞아도)', () => {
    expect(isValidNickname('지름 알림')).toBe(false);
  });

  /**
   * ★web 은 `Intl.Segmenter` 로 자소를 센다. Hermes 엔 그 API 가 없어
   * 코드포인트 스프레드로 대체했다 — 서로게이트 페어(이모지)가 2로 세지지
   * 않는다는 점이 핵심이다(`'👩'.length === 2` 인데 1로 세야 한다).
   */
  it('서로게이트 페어를 한 글자로 센다(length 와 다르다)', () => {
    expect('👩👨'.length).toBe(4);
    expect(countChars('👩👨')).toBe(2);
    expect(isValidNickname('👩👨')).toBe(true);
  });
});

describe('키워드 — web useKeywordInput(공백 제거 후 2~20자)', () => {
  it('앞뒤 공백은 세지 않는다', () => {
    expect(isValidKeyword('  램  ')).toBe(false); // trim 후 1자
    expect(isValidKeyword('  램8  ')).toBe(true);
  });

  it('20자까지 허용, 21자는 거절', () => {
    expect(isValidKeyword('가'.repeat(20))).toBe(true);
    expect(isValidKeyword('가'.repeat(21))).toBe(false);
  });
});

describe('비밀번호 — web useChangePasswordFormViewModel.validate 와 같은 판정', () => {
  it('빈 값은 오류가 아니다(아직 안 친 상태)', () => {
    expect(validatePassword('')).toEqual({
      error: false,
      invalidType: false,
      invalidLength: false,
    });
  });

  it('8자 미만은 길이 위반', () => {
    expect(validatePassword('ab12!').invalidLength).toBe(true);
  });

  it('30자 초과는 길이 위반', () => {
    expect(validatePassword(`${'a'.repeat(30)}1`).invalidLength).toBe(true);
  });

  it('한 종류만 쓰면 조합 위반', () => {
    expect(validatePassword('abcdefghij').invalidType).toBe(true);
  });

  it('영문+숫자 2종이면 통과', () => {
    expect(validatePassword('abcdefg123')).toEqual({
      error: false,
      invalidType: false,
      invalidLength: false,
    });
  });

  it('영문+특수문자 2종이면 통과', () => {
    expect(validatePassword('abcdefg!@#').error).toBe(false);
  });
});

describe('관심 카테고리 — web shared/config/categories.ts 와 id·순서·이름이 같다', () => {
  /**
   * ★서버에 보내는 값이 id 라 하나만 어긋나도 **엉뚱한 카테고리가 저장된다.**
   * web 설정 파일을 직접 읽어 대조하므로, web 이 바뀌면 이 테스트가 깨져 알려준다.
   */
  const web = readWeb('shared/config/categories.ts');
  const webPairs = [
    ...web.matchAll(/text:\s*'([^']+)',\s*\n\s*value:\s*(\d+)/g),
  ].map(m => ({text: m[1], value: Number(m[2])}));

  it('web 파싱이 실제로 됐다(정규식이 헛돌면 아래 대조가 무의미하다)', () => {
    expect(webPairs.length).toBeGreaterThan(5);
  });

  it('순서까지 같다', () => {
    expect(
      CATEGORIES.map((c: {text: string; value: number}) => ({
        text: c.text,
        value: c.value,
      })),
    ).toEqual(webPairs);
  });

  it('최대 선택 수는 web 과 같은 5', () => {
    expect(MAX_SELECTION_COUNT).toBe(5);
    expect(web).toContain('MAX_SELECTION_COUNT = 5');
  });

  it('이모지가 모두 채워져 있다(카드에 그리는 값이다)', () => {
    CATEGORIES.forEach((c: {icon: string}) => expect(c.icon).toBeTruthy());
  });
});

describe('출생년도 — web BIRTH_YEAR(100년) + 선택안함', () => {
  const options = buildBirthYearOptions(new Date('2026-09-07T00:00:00Z'));

  it('맨 앞이 선택안함(null)', () => {
    expect(options[0]).toEqual({text: '선택안함', value: null});
  });

  it('올해부터 100년', () => {
    expect(options).toHaveLength(101);
    expect(options[1]).toEqual({text: '2026', value: '2026'});
    expect(options[100]).toEqual({text: '1927', value: '1927'});
  });
});
