import {useEffect, useState} from 'react';
import Constants from 'expo-constants';

import {fetchReleasePolicy} from '@/shared/lib/update/release-policy';
import {isBelowMinimum} from '@/shared/lib/update/version';

/**
 * 스토어 업데이트가 필요한지 판정한다.
 *
 * OTA(expo-updates)가 JS 변경은 덮지만, 네이티브가 바뀌면 구버전 앱은 OTA 를
 * 못 받고 깨진 채로 남는다. 그때 유저를 스토어로 보내는 장치.
 *
 * ★강제는 비상 수단이다 — 평소의 "새 버전 나왔어요" 는 UpdateAvailableSheet(권유)가 한다.
 * 정책은 web 이 서빙하는 정적 JSON 에서 읽는다(release-policy). GraphQL 에 필드를 만들면
 * 서버 레포 배포와 묶이는데, 이건 "값 하나 올리기"라 프론트 배포만으로
 * 끝나는 편이 가볍다(되돌리기도 값만 낮추면 된다).
 */
export default function useForceUpdate(): {needsUpdate: boolean} {
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReleasePolicy().then(policy => {
      const current = Constants.expoConfig?.version ?? '';
      if (
        !cancelled &&
        policy &&
        isBelowMinimum(current, policy.minSupportedVersion)
      ) {
        setNeedsUpdate(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {needsUpdate};
}
