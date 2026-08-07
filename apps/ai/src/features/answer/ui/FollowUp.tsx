import Link from 'next/link';

import { roomHref } from './examples';

/**
 * 되묻기 제안.
 *
 * ★왜 필요한가: 답이 끝나면 화면 아래엔 **빈 입력창**만 남는다. 유저는 "뭘 더 물어볼 수
 * 있는지" 모르는 상태로 방치된다 — 이 앱이 답할 수 있는 범위가 좁아서(시세·평판) 더 그렇다.
 * 다음 질문을 눌러볼 수 있게 놓으면, 답할 수 있는 것만 골라 제안하므로
 * 오라우팅(못 답하는 질문)도 같이 줄어든다.
 *
 * 제출은 `roomHref` 로 라우팅한다 — Composer 와 **같은 경로**라
 * "질문 하나 = URL 하나"(뒤로가기 한 단계) 규칙이 깨지지 않는다.
 */
export default function FollowUp({ suggestions }: { suggestions: string[] }) {
  if (suggestions.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-gray-500">이어서 물어보기</p>
      <ul className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <li key={s}>
            <Link
              href={roomHref(s)}
              className="tappable block rounded-full border border-gray-300 bg-white px-3.5 py-2 text-[13px] text-gray-700 active:border-gray-400 active:bg-gray-50"
            >
              {s}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
