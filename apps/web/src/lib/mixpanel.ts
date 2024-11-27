'use client';

import mixpanel, { Mixpanel } from 'mixpanel-browser';
import { useEffect } from 'react';

import { IS_PRD } from '@/constants/env';
import { httpClient } from '@/shared/lib/http-client';

class MixpanelService {
  private static instance: Mixpanel;

  private constructor() {}

  public static getInstance(): Mixpanel {
    if (IS_PRD && typeof window !== 'undefined' && !MixpanelService.instance) {
      mixpanel.init('99abe16c628a67e5eabe97cce1956b82', {
        debug: true,
        track_pageview: 'full-url',
        persistence: 'localStorage',
        ignore_dnt: true,
      });
      const distinctId = mixpanel.get_distinct_id();
      httpClient.setDistintId(distinctId);
      MixpanelService.instance = mixpanel;
    } else {
      // mock when not prd
      MixpanelService.instance = {} as any;
      MixpanelService.instance.track = (event: string, props?: any) => {
        console.info('Mixpanel track:', event, props);
      };
      MixpanelService.instance.get_distinct_id = (user?: any) => {
        console.info('Mixpanel get_distinct_id:', user);
      };
    }

    return MixpanelService.instance;
  }

  public static getDistinctId(): string | null {
    if (MixpanelService.instance) {
      return mixpanel.get_distinct_id();
    }

    return null;
  }
}

export const mp = MixpanelService.getInstance();

export function InitMixpanel() {
  useEffect(() => {
    if (mp) {
      MixpanelService.getInstance();
    }
  }, []);

  return undefined;
}
