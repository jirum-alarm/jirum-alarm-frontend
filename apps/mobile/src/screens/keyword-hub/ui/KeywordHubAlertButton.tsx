import React, {useEffect} from 'react';

import Button from '@/shared/components/ui/Button';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {useKeywordAlert} from '@/features/keyword-prompt/model/useKeywordAlert';

/**
 * 허브 머리의 알림 버튼 — 누르면 그 자리에서 이 키워드로 알림을 건다(web widgets/keyword-hub KeywordHubAlertButton).
 * 허브 목록은 알림 구독 상위 키워드라, 허브에 온 사람이 알림으로 넘어가는 비율이 이 화면의 존재 이유에 가장 가깝다.
 * 등록은 검색 결과 위 한 줄과 같은 경로(useKeywordAlert) — 이미 등록이면 「알림 받는 중」.
 * 계측(web 과 같은 이름·값): keyword_register source=keyword_hub, keyword_prompt_view/click placement=keyword_hub.
 */
export default function KeywordHubAlertButton({keyword}: {keyword: string}) {
  const {trimmed, isOn, canRegister, register} = useKeywordAlert(
    keyword,
    'keyword_hub',
  );

  const visible = canRegister && !isOn;
  useEffect(() => {
    if (!visible) return;
    Analytics.track('keyword_prompt_view', {
      keyword: trimmed,
      placement: 'keyword_hub',
    });
  }, [visible, trimmed]);

  if (!canRegister) return null;

  if (isOn) {
    return (
      <Button color="secondary" disabled>
        {`‘${trimmed}’ 알림 받는 중`}
      </Button>
    );
  }

  return (
    <Button
      onPress={() => {
        Analytics.track('keyword_prompt_click', {
          keyword: trimmed,
          placement: 'keyword_hub',
        });
        register();
      }}>
      {`‘${trimmed}’ 핫딜 알림 받기`}
    </Button>
  );
}
