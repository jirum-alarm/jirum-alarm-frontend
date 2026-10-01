import React, {useEffect, useState} from 'react';
import {Linking} from 'react-native';
import Constants from 'expo-constants';

import ConfirmSheet from '@/shared/components/ConfirmSheet';
import {shouldShowPushPrePrompt} from '@/shared/components/PushPermissionPrePrompt';
import {StorageKey} from '@/shared/constant/storage-key';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {
  fetchReleasePolicy,
  shouldOfferUpdate,
  storeUrl,
} from '@/shared/lib/update/release-policy';

// 홈이 다 그려진 뒤 — 들어오자마자 시트가 덮으면 관문처럼 느껴진다.
const SHOW_DELAY_MS = 2500;

/**
 * "새 버전이 나왔어요" — **권유**다. 닫으면 그 버전에 대해선 다시 안 띄운다.
 *
 * 강제 업데이트(ForceUpdateScreen)는 옛 버전이 실제로 깨질 때만 쓴다. 평소엔 OTA 가 JS 를
 * 조용히 바꾸고, 스토어 버전은 OS 자동 업데이트가 대부분 올려 준다 — 이 시트는 그걸 놓친
 * 사람에게 한 번 알려주는 정도면 된다.
 */
export default function UpdateAvailableSheet() {
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [policy, offered, pushFirst] = await Promise.all([
          fetchReleasePolicy(),
          getAsyncStorage(StorageKey.UPDATE_OFFERED_VERSION),
          shouldShowPushPrePrompt(),
        ]);
        if (cancelled || pushFirst) return;
        const current = Constants.expoConfig?.version ?? '';
        if (policy && shouldOfferUpdate(current, policy, offered)) {
          setLatest(policy.latestVersion);
          Analytics.track('update_prompt_view', {
            current,
            latest: policy.latestVersion,
          });
        }
      } catch {
        // 권유는 못 띄워도 그만이다.
      }
    }, SHOW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const close = (accepted: boolean) => {
    if (latest) {
      setAsyncStorage(StorageKey.UPDATE_OFFERED_VERSION, latest).catch(
        () => {},
      );
      Analytics.track('update_prompt_click', {latest, accepted});
    }
    setLatest(null);
    if (accepted) Linking.openURL(storeUrl()).catch(() => {});
  };

  return (
    <ConfirmSheet
      visible={latest !== null}
      title="새 버전이 나왔어요"
      description="더 빠르고 편해진 지름알림을 만나보세요."
      cancelLabel="나중에"
      confirmLabel="업데이트"
      onCancel={() => close(false)}
      onConfirm={() => close(true)}
    />
  );
}
