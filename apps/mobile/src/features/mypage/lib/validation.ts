/**
 * 내정보 입력 검증. web 의 뷰모델 안에 흩어져 있던 규칙을 **순수 함수**로 뺐다.
 *
 * ★뷰모델 안에 두면 테스트가 소스텍스트 검사밖에 안 되고, 규칙이 web 과
 * 어긋나도 못 잡는다(런북: "판정 로직만 순수 함수로 떼어 실행하라").
 */

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;
const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORD_LENGTH = 20;

/**
 * 글자 수. web 은 `[...new Intl.Segmenter().segment(v)].length` 로 자소를 센다.
 *
 * ponytail: RN 의 Hermes 엔진엔 `Intl.Segmenter` 가 없다 — 그대로 옮기면
 * **기기에서만** 터진다(jest 는 Node 라 통과해서 못 잡는다). 코드포인트 단위
 * 스프레드로 센다. 한글·영문·숫자에선 결과가 같고, 갈라지는 건 ZWJ 로 묶인
 * 이모지뿐이다(닉네임·키워드에서 실질적 차이가 없다).
 */
export function countChars(value: string): number {
  return [...value].length;
}

export function isValidNickname(value: string): boolean {
  const length = countChars(value);
  return (
    length >= MIN_NICKNAME_LENGTH &&
    length <= MAX_NICKNAME_LENGTH &&
    !value.includes(' ')
  );
}

/** 키워드는 앞뒤 공백을 버린 뒤 길이를 센다(web 과 같다). */
export function isValidKeyword(value: string): boolean {
  const length = countChars(value.trim());
  return length >= MIN_KEYWORD_LENGTH && length <= MAX_KEYWORD_LENGTH;
}

export type PasswordValidity = {
  error: boolean;
  invalidType: boolean;
  invalidLength: boolean;
};

/**
 * 새 비밀번호 규칙 — web `useChangePasswordFormViewModel.validate` 와 같다.
 * 빈 값은 "아직 안 침"이라 오류로 보지 않는다(헬퍼 문구가 회색으로 남는다).
 */
export function validatePassword(value: string): PasswordValidity {
  if (value === '') {
    return {error: false, invalidType: false, invalidLength: false};
  }

  const hasAlphabet = /[a-zA-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value);

  const validType =
    [hasAlphabet, hasNumber, hasSpecial].filter(Boolean).length >= 2;
  const validLength = /^(.{8,30})$/.test(value);

  return {
    error: !validType || !validLength,
    invalidType: !validType,
    invalidLength: !validLength,
  };
}

export const NICKNAME_HELPER_TEXT = '공백없이 2~12자로 입력해주세요.';
export const KEYWORD_HELPER_TEXT =
  '키워드는 2자 이상 20자까지 입력할 수 있어요.';
