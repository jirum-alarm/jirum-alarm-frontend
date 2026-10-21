'use client';

import { useEffect, useState } from 'react';

import { parseEntrance } from '@/shared/libs/entrance';

/** 들어온 입구(utm_source). 정적 페이지라 서버가 쿼리를 못 본다 → 마운트 뒤 브라우저 주소에서 읽는다. */
export const useEntrance = () => {
  const [entrance, setEntrance] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 주소는 브라우저에만 있다(정적 export). 첫 렌더를 서버 HTML 과 맞추려 마운트 뒤에 읽는다.
    setEntrance(parseEntrance(window.location.search));
  }, []);
  return entrance;
};
