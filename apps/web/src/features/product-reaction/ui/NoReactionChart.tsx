'use client';

import { ReactionChart } from '@/entities/product';

export function NoReactionChart() {
  return <ReactionChart disabled positiveCount={6} negativeCount={4} allCount={10} />;
}
