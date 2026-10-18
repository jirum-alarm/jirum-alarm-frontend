import {useCallback, useState} from 'react';

import {tick} from '@/shared/lib/feedback/haptic';

/**
 * 당겨서 새로고침 — 스피너는 당기는 동안만(CurationGrid 와 같은 패턴).
 * `refreshing={false}` 로 두면 놓자마자 스피너가 사라져 새로고침이 됐는지 모른다.
 * 당김이 걸리는 순간 짧게 진동한다(iOS 기본 앱들처럼).
 */
export function usePullRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    tick();
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return {refreshing, onRefresh};
}
