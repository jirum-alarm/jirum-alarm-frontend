'use client';

import { useEffect } from 'react';

type DataLayer = Record<string, unknown>[];

/**
 * GA4 content_group=season — 시즌 허브 페이지뷰를 따로 묶는다(뷰티 앱의 content_group=beauty 와 같은 GTM 데이터 영역 변수).
 * GTM 은 load 뒤에 붙으므로(AppProvider lazyOnload) 마운트 때 넣으면 첫 페이지뷰에 실린다. 떠날 때 비워 다른 화면에 남지 않게 한다.
 */
export default function SeasonContentGroup() {
  useEffect(() => {
    const dataLayer = ((window as unknown as { dataLayer?: DataLayer }).dataLayer ??= []);
    dataLayer.push({ content_group: 'season' });
    return () => {
      dataLayer.push({ content_group: undefined });
    };
  }, []);
  return null;
}
