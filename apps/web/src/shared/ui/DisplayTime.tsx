'use client';

import { useEffect, useState } from 'react';

import { displayTime, toIsoInstant } from '@/shared/lib/utils/displayTime';

/**
 * 상대 시각("3시간 전")을 보여주되 `<time datetime>` 으로 절대 시각을 함께 남긴다.
 *
 * 화면은 그대로고 마크업만 바뀐다. 상대 시각만 있으면 크롤러·AI 가 "이 정보가 언제 것인지"를
 * 판단할 근거가 아예 없다 — 2024년 딜을 "지금 가격"으로 인용하던 원인 중 하나(2026-09-03 실측:
 * ChatGPT-User 가 가져간 상품 8건 중 2건이 2024년 딜). `postedAt` 은 백엔드가 UTC ISO 절대
 * 시각으로 주므로 서버·클라이언트가 같은 문자열을 만든다(하이드레이션 안전).
 */
export default function DisplayTime({ time }: { time: string | Date }) {
  const [mountedTime, setMountedTime] = useState<string | null>(null);

  useEffect(() => {
    setMountedTime(displayTime(time));
  }, [time]);

  const text = mountedTime || displayTime(time);
  const iso = toIsoInstant(time);

  if (!iso) {
    return <span suppressHydrationWarning>{text}</span>;
  }

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
