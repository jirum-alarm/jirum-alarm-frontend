/**
 * 임시 질문 게이트 — 허용 목록 밖 유저에게 입력창 대신 보여준다.
 * 카피 한 곳. 공개 시 AskLock·Chat 분기와 함께 지운다.
 */
export default function RestrictedNotice() {
  return (
    <p className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-center text-[14px] leading-relaxed text-gray-600">
      지금은 내부 테스트 중이라 질문을 받을 수 없어요.
    </p>
  );
}
