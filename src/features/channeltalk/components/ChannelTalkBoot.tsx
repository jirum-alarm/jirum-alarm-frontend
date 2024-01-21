'use client';

import { useEffect } from 'react';
import ChannelService from '../lib/channel-service';

const CHANNEL_PLUGIN_KEY = 'a3e5d0f0-64d2-4d45-ad6f-0ce107803f6a';

const ChannelTalkBoot = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    ChannelService.loadScript();
    ChannelService.boot({
      pluginKey: CHANNEL_PLUGIN_KEY,
    });
    ChannelService.hideChannelButton();
  }, []);
  return null;
};

export default ChannelTalkBoot;
