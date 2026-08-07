'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { EXAMPLES, roomHref } from './examples';
import { startRoomTransition } from './transition';

/**
 * 막다른 길에 다음 행동을 놓는다.
 *
 * ★무결과 화면 카피가 "아래 예시를 눌러보세요" 라고 하는데 **그 화면에 예시가 없었다**
 * (예시 칩은 홈에만 존재). 아래 570px 는 빈 공간이고 유저가 할 수 있는 건 재타이핑뿐.
 * 문구를 고치는 게 아니라 UI 를 문구에 맞추는 쪽이 맞다.
 *
 * 칩도 입력창 제출과 같은 전환 애니메이션을 쓴다 — 같은 "질문하기" 행동인데
 * 한쪽만 하드컷이면 둘 중 하나가 고장난 것처럼 보인다.
 */
export default function ExampleChips({ exclude }: { exclude?: string }) {
  const items = EXAMPLES.filter((e) => e !== exclude);
  const router = useRouter();

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((e) => (
        <li key={e}>
          <Link
            href={roomHref(e)}
            onClick={(ev) => {
              ev.preventDefault();
              /*
               * hero: **누른 칩만** 대화방의 질문 버블과 같은 이름을 갖는다.
               * 이름은 한 시점에 유일해야 하므로(중복이면 전환 자체가 취소된다)
               * 클래스로 미리 박지 않고 클릭 순간에만 붙였다가 되돌린다.
               */
              const chip = ev.currentTarget;
              chip.style.viewTransitionName = 'bubble';
              startRoomTransition(
                () => router.push(roomHref(e)),
                () => {
                  chip.style.viewTransitionName = '';
                },
              );
            }}
            className="tappable block rounded-full border border-gray-200 bg-white/70 px-3.5 py-2 text-[13px] text-gray-700 active:border-gray-400 active:bg-gray-50"
          >
            {e}
          </Link>
        </li>
      ))}
    </ul>
  );
}
