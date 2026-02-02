import { AuthQueries } from '@/entities/auth';
import { useSuspenseQuery } from '@tanstack/react-query';


import { useRemoveKeyword } from './remove-keyword';

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
  return { notificationKeywordsByMe, onDeleteKeyword };
};
