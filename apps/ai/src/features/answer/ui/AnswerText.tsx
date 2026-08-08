/**
 * LLM 생성 문장. `patch` 로 토큰이 붙는 동안에도 계속 렌더된다.
 *
 * ★마크다운 파서를 넣지 않는다. 지금 서버가 보내는 것은 평문이고, 파서를 붙이면
 * 의존성 + XSS 표면이 생긴다. 실제로 굵게·목록이 필요해지면 그때 넣는다
 * (`dangerouslySetInnerHTML` 은 쓰지 않는다 — LLM 출력은 신뢰 경계 밖이다).
 *
 * `whitespace-pre-wrap` 이 줄바꿈만 살린다 — 그게 지금 필요한 전부다.
 */
export default function AnswerText({ markdown }: { markdown: string }) {
  // 스트리밍 시작 직후엔 빈 문자열이다. 빈 말풍선이 번쩍이지 않게 아무것도 그리지 않는다.
  if (markdown.length === 0) return null;

  return (
    <p className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-gray-800">
      {markdown}
    </p>
  );
}
