'use client';

import { useEffect, useState } from 'react';

import { displayTime } from '@/util/displayTime';

export default function DisplayTime({ time }: { time: string | Date }) {
  const [mountedTime, setMountedTime] = useState<string | null>(null);

  useEffect(() => {
    setMountedTime(displayTime(time));
  }, [time]);

  return <span suppressHydrationWarning>{mountedTime || displayTime(time)}</span>;
}
