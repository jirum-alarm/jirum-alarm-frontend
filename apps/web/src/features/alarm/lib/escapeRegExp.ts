// 키워드는 유저가 등록한 임의 문자열(예: "1++", "C++")이라 정규식 메타문자를 포함할 수 있다.
// 이스케이프하지 않으면 new RegExp 가 SyntaxError 를 던져 알림 페이지가 통째로 흰화면이 됐다.
export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
