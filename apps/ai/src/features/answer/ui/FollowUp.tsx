'use client';

import Link from 'next/link';

import { useAsk } from './AskContext';
import { roomHref } from './examples';

/**
 * 되묻기 제안.
 *
 * ★왜 필요한가: 답이 끝나면 화면 아래엔 **빈 입력창**만 남는다. 유저는 "뭘 더 물어볼 수
 * 있는지" 모르는 상태로 방치된다 — 이 앱이 답할 수 있는 범위가 좁아서(시세·평판) 더 그렇다.
 * 다음 질문을 눌러볼 수 있게 놓으면, 답할 수 있는 것만 골라 제안하므로
 * 오라우팅(못 답하는 질문)도 같이 줄어든다.
 *
 * ★제출은 **같은 대화에 턴을 쌓는다**(멀티턴). 라우팅하면 리마운트돼 앞 대화가 사라진다 —
 * 그게 이 칩의 요점(맥락 이어가기)과 정반대다.
 * 대화 밖(context 없음)에서는 링크로 폴백해 새 방을 연다.
 *
 * ⚠️ 제안 문장은 `buildFollowUps` 가 만들고, 그 문장이 `extractProductTerm` 을 통과할 때
 * 상품 토큰만 남아야 한다 — '후기'·'거' 가 남으면 오염 게이트가 조용히 죽는다
 * (실측 2026-08-08, intent.test.ts 의 왕복 테스트가 이걸 지킨다).
 */
export default function FollowUp({ suggestions }: { suggestions: string[] }) {
  const ask = useAsk();
  if (suggestions.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-gray-500">이어서 물어보기</p>
      <ul className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <li key={s}>
            {ask ? (
              <button
                type="button"
                onClick={() => ask(s)}
                className="tappable block rounded-full border border-gray-300 bg-white px-3.5 py-2 text-[13px] text-gray-700 active:border-gray-400 active:bg-gray-50"
              >
                {s}
              </button>
            ) : (
              <Link
                href={roomHref(s)}
                className="tappable block rounded-full border border-gray-300 bg-white px-3.5 py-2 text-[13px] text-gray-700 active:border-gray-400 active:bg-gray-50"
              >
                {s}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
