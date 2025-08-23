'use client';

import { ReactionChart } from './ReactionChart';

export function NoReactionChart({ url, provider }: { url: string; provider: string }) {
  return (
    <ReactionChart
      disabled
      positiveCount={6}
      negativeCount={4}
      allCount={10}
      url={url}
      provider={provider}
    />
  );
}
