import {useCallback, useState} from 'react';

/**
 * 당겨서 새로고침 — 스피너는 당기는 동안만(CurationGrid 와 같은 패턴).
 * `refreshing={false}` 로 두면 놓자마자 스피너가 사라져 새로고침이 됐는지 모른다.
 */
export function usePullRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return {refreshing, onRefresh};
}
