import { queryOptions } from '@tanstack/react-query';

import { SettingService } from '@/shared/api/setting';

export const SettingQueries = {
  all: () => ['setting'],
  pushSetting: () =>
    queryOptions({
      queryKey: [...SettingQueries.all(), 'push'],
      queryFn: () => SettingService.getPushSetting(),
    }),
};
