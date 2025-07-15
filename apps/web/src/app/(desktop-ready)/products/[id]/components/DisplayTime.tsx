'use client';

import { useIsHydrated } from '@/hooks/useIsHydrated';
import { displayTime } from '@/util/displayTime';

export default function DisplayTime({ time }: { time: Date }) {
  const isHydrated = useIsHydrated();

  return isHydrated ? displayTime(time) : '';
}
