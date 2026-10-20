import {useEffect} from 'react';
import {AppState} from 'react-native';

import {recordActiveDay} from '@/shared/lib/store-review';

/** 앱을 쓴 날을 남긴다(켤 때·앞으로 올 때) — 스토어 평점은 여러 날 쓴 사람에게만 묻는다. 실패는 삼킨다. */
export default function useRecordActiveDay(): void {
  useEffect(() => {
    recordActiveDay().catch(() => {});
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') recordActiveDay().catch(() => {});
    });
    return () => subscription.remove();
  }, []);
}
