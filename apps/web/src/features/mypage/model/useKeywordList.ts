import { useSuspenseQuery } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

import { useRemoveKeyword } from './remove-keyword';

/**
 * `priceDropOnly` 는 쿼리(QueryMypageKeyword)에서 이미 받아오지만 codegen 생성 타입에는
 * 없다 — dev 엔드포인트가 죽어 스키마 재생성이 막혀 있기 때문(shared/api/keyword 주석 참고).
 * dev 복구 후 codegen 을 돌리면 이 보강은 지워도 된다.
 */
type KeywordWithPriceDropOnly = { id: string; keyword: string; priceDropOnly?: boolean };

export const useKeywordList = () => {
  const {
    data: { notificationKeywordsByMe },
  } = useSuspenseQuery(AuthQueries.myKeywords({ limit: 20 }));

  const { mutate: removeNotificationKeyword } = useRemoveKeyword();
  const onDeleteKeyword = (id: string) => {
    removeNotificationKeyword({
      id: Number(id),
    });
  };
  return {
    notificationKeywordsByMe: notificationKeywordsByMe as KeywordWithPriceDropOnly[] | undefined,
    onDeleteKeyword,
  };
};
