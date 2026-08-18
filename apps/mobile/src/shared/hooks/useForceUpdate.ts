import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import Constants from 'expo-constants';

import {SERVICE_URL} from '@/constants/env';
import {isBelowMinimum} from '@/shared/lib/update/version';

/**
 * 스토어 업데이트가 필요한지 판정한다.
 *
 * OTA(expo-updates)가 JS 변경은 덮지만, 네이티브가 바뀌면 구버전 앱은 OTA 를
 * 못 받고 깨진 채로 남는다. 그때 유저를 스토어로 보내는 장치.
 *
 * 정책은 web 이 서빙하는 정적 JSON 에서 읽는다. GraphQL 에 필드를 만들면
 * 서버 레포 배포와 묶이는데, 이건 "값 하나 올리기"라 프론트 배포만으로
 * 끝나는 편이 가볍다(되돌리기도 값만 낮추면 된다).
 */
export default function useForceUpdate(): {needsUpdate: boolean} {
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 캐시된 옛 정책을 읽으면 정책을 올려도 안 먹는다. RN fetch 타입엔
        // cache 옵션이 없어 헤더로 막는다(파일이 작아 매번 받아도 부담 없다).
        const res = await fetch(`${SERVICE_URL}/app-release.json`, {
          headers: {'Cache-Control': 'no-cache'},
        });
        if (!res.ok) return;

        const policy = (await res.json()) as Record<
          string,
          {minSupportedVersion?: string} | undefined
        >;
        const min = policy[Platform.OS]?.minSupportedVersion ?? '';
        const current = Constants.expoConfig?.version ?? '';

        if (!cancelled && isBelowMinimum(current, min)) {
          setNeedsUpdate(true);
        }
      } catch {
        // 네트워크 실패로 앱을 잠그지 않는다 — 정책을 못 읽으면 그냥 통과.
        // ponytail: 실패 시 재시도 없음. 다음 앱 실행에서 다시 본다.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {needsUpdate};
}
