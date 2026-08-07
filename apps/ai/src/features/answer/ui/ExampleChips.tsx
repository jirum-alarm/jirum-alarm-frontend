import Link from 'next/link';

import { EXAMPLES, roomHref } from './examples';

/**
 * 막다른 길에 다음 행동을 놓는다.
 *
 * ★무결과 화면 카피가 "아래 예시를 눌러보세요" 라고 하는데 **그 화면에 예시가 없었다**
 * (예시 칩은 홈에만 존재). 아래 570px 는 빈 공간이고 유저가 할 수 있는 건 재타이핑뿐.
 * 문구를 고치는 게 아니라 UI 를 문구에 맞추는 쪽이 맞다.
 */
export default function ExampleChips({ exclude }: { exclude?: string }) {
  const items = EXAMPLES.filter((e) => e !== exclude);

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((e) => (
        <li key={e}>
          <Link
            href={roomHref(e)}
            className="tappable block rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-gray-700 active:border-gray-400 active:bg-gray-50"
          >
            {e}
          </Link>
        </li>
      ))}
    </ul>
  );
}
