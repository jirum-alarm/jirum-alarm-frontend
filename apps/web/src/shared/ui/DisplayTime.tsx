'use client';

import { displayTime } from '@/util/displayTime';

export default function DisplayTime({ time }: { time: Date }) {
  return <span suppressHydrationWarning>{displayTime(time)}</span>;
}
