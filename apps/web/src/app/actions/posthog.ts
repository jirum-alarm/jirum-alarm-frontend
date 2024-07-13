'use server';
import { cookies } from 'next/headers';
import { postHogClient } from '@/lib/posthog';

type FeatureFlags = 'MAIN_PAGE_RENEWAL_FEATURE';

interface BootstrapData {
  distinctID: string;
  featureFlags: Record<FeatureFlags, string | boolean>;
}

interface BootstrapCookie {
  name: 'bootstrapData';
  value: string;
}

async function getFeatureFlag() {
  const posthog = postHogClient();
  const cookie = cookies().get('bootstrapData') as BootstrapCookie;
  const { distinctID, featureFlags } = JSON.parse(cookie.value) as BootstrapData;
  posthog.capture({
    distinctId: distinctID,
    event: 'Page was loaded',
  });
  const flags = (await posthog.getAllFlags(distinctID)) as Record<FeatureFlags, string | boolean>;

  return { flags };
}

export { getFeatureFlag };
