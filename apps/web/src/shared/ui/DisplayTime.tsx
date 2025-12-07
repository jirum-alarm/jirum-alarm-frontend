'use client';

import { displayTime } from '@/shared/lib/utils/displayTime';

export default function DisplayTime({ time }: { time: Date }) {
  return <span suppressHydrationWarning>{displayTime(time)}</span>;
}
