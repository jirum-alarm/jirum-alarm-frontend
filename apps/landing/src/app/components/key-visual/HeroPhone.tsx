import Image from 'next/image';

import Icon from '../icons';

/**
 * 히어로 오른쪽 폰 — 잠금화면에 실제로 오는 알림을 그린다.
 * 키워드 알림은 딜이 들어오자마자 근거 없이 나가고(「삼다수 키워드 알림 💌」), 근거가 확인되면 ✅ 알림이 한 번 더 온다
 * (「✅ 삼다수 알림 딜, 보통가보다 …원 싸요」). 최근 딜보다 싸면 제목부터 다르다(「콜라 최근 딜보다 싸게 떴어요 📉」).
 * 제목 모양은 crawling-server notification/util/alert-title.ts 와 같다 —
 * 그쪽 모양이 바뀌면 같이 고친다. 숫자는 web /help 근거 예시와 같은 예시 값이다.
 *
 * 폰 둘레의 떠 있는 카드 둘은 알림을 거르는 조건(제외 단어·가격 범위)과 상세의 근거 칸 — 넓은 화면에서만 보인다.
 */

const NOTIFICATIONS = [
  {
    time: '방금',
    title: '✅ 삼다수 알림 딜, 보통가보다 3,100원 싸요 (19%)',
    body: '제주 삼다수 2L 24병 12,900원',
  },
  {
    time: '12분 전',
    title: '삼다수 키워드 알림 💌',
    body: '[에펨코리아] 제주 삼다수 2L 24병 (12,900원/무료)',
  },
  {
    time: '1시간 전',
    title: '콜라 최근 딜보다 싸게 떴어요 📉',
    body: '[뽐뿌] 코카콜라 제로 355ml 24캔 15,900원',
  },
];

const HeroPhone = () => (
  <figure className="relative mx-auto w-full max-w-72 lg:mx-0 lg:max-w-80">
    {/* 폰 뒤 라임 빛 — 짙은 히어로 위에서 폰 윤곽이 묻히지 않게 */}
    <div className="bg-primary-500/20 pointer-events-none absolute inset-x-4 top-1/4 h-1/2 rounded-full blur-3xl" />

    {/* 넓은 화면: 폰 왼쪽 위 — 키워드에 건 조건 */}
    <div className="shadow-card absolute top-10 -left-36 z-10 hidden w-52 rounded-2xl bg-white p-3.5 xl:block">
      <div className="flex items-center gap-2">
        <span className="bg-primary-500 text-fixed-900 flex size-7 items-center justify-center rounded-full">
          <Icon name="bell" className="size-4" />
        </span>
        <p className="text-sm font-bold text-gray-900">삼다수</p>
      </div>
      <p className="mt-2 text-xs text-gray-500">제외 단어 · 탄산수</p>
      <p className="text-xs text-gray-500">가격 · 15,000원 이하만</p>
    </div>

    {/* 넓은 화면: 폰 오른쪽 아래 — 상세의 근거 칸 */}
    <div className="shadow-card absolute -right-28 bottom-24 z-10 hidden w-64 rounded-2xl bg-white p-3.5 break-keep xl:block">
      <div className="flex gap-2.5">
        <span className="bg-error-50 text-error-600 flex size-7 shrink-0 items-center justify-center rounded-full">
          <Icon name="tag" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            보통가보다 <b className="text-error-600 font-bold">3,100원</b> 싸요
          </p>
          <p className="mt-0.5 text-xs text-gray-500">지난 1년 핫딜 14건 중 85%보다 싸요</p>
        </div>
      </div>
    </div>

    {/* eslint-disable-next-line no-restricted-syntax -- 폰 몸체 모서리(44px) — 기기 모양이라 토큰 눈금 밖 */}
    <div className="bg-fixed-800 border-fixed-white/10 relative rounded-[44px] border p-2 shadow-lg">
      {/* eslint-disable-next-line no-restricted-syntax -- 폰 화면 모서리(36px) — 몸체 모서리에서 테두리만큼 뺀 값 */}
      <div className="bg-fixed-900 relative aspect-9/18 overflow-hidden rounded-[36px] px-3 pt-3">
        {/* 잠금화면 바탕 — 아래쪽 라임 빛(소개 영상의 잠금화면과 같은 느낌) */}
        <div className="bg-primary-500/25 pointer-events-none absolute -bottom-20 left-1/2 size-64 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="relative mx-auto h-6 w-24 rounded-full bg-black" />
        <p className="text-fixed-300 relative mt-6 text-center text-sm font-medium">
          10월 21일 화요일
        </p>
        <p className="text-fixed-white relative text-center text-[56px] leading-none font-bold">
          9:41
        </p>

        <ul className="relative mt-6 space-y-2">
          {NOTIFICATIONS.map((n) => (
            <li key={n.title} className="bg-fixed-white/90 rounded-2xl px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Image
                  src="/assets/icons/logo.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="bg-fixed-900 size-4 rounded-sm"
                />
                <span className="text-fixed-600 text-11 font-medium">지름알림</span>
                <span className="text-fixed-600 text-11 ml-auto">{n.time}</span>
              </div>
              <p className="text-fixed-900 mt-1 text-xs leading-snug font-semibold">{n.title}</p>
              <p className="text-fixed-600 text-xs leading-snug">{n.body}</p>
            </li>
          ))}
        </ul>
        {/* 잠금화면 아래 손전등·카메라 단추 */}
        <span className="bg-fixed-white/10 absolute bottom-6 left-6 size-10 rounded-full" />
        <span className="bg-fixed-white/10 absolute right-6 bottom-6 size-10 rounded-full" />
      </div>
    </div>
    <figcaption className="sr-only">
      예시 화면: 「삼다수」 키워드에 맞는 핫딜이 올라오자 알림이 오고, 보통가보다 싸다는 근거가
      확인되자 한 번 더 알림이 온다
    </figcaption>
  </figure>
);

export default HeroPhone;
