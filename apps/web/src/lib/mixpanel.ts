'use client';

import mixpanel, { Mixpanel } from 'mixpanel-browser';
import { useEffect } from 'react';

import { IS_PRD } from '@/constants/env';

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
      MixpanelService.instance = mixpanel;
    } else {
      // mock when not prd
      MixpanelService.instance = {} as any;
      MixpanelService.instance.track = (event: string, props?: any) => {
        console.info('Mixpanel track:', event, props);
      };
    }

    return MixpanelService.instance;
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
