import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { INotification } from '@/graphql/interface';
import { QueryNotifications } from '@/graphql/notification';

const limit = 20;

export const useNotificationsViewModel = () => {
  const [page, setPage] = useState(1);
  const [hasNextData, setHasNextData] = useState(true);

  const {
    data: { notifications } = { notifications: [] },
    loading,
    error,
    fetchMore,
  } = useQuery<{ notifications: INotification[] }>(QueryNotifications, {
    variables: { offset: 0, limit },
  });

  const noData = !loading && notifications.length === 0;

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextData) {
        fetchMore({
          variables: {
            offset: page * limit,
          },
          updateQuery: ({ notifications }, { fetchMoreResult }) => {
            if (fetchMoreResult.notifications.length < limit) {
              setHasNextData(false);
            }
            return {
              notifications: [...notifications, ...fetchMoreResult.notifications],
            };
          },
        });
      }

      setPage(page + 1);
    },
  });

  useEffect(() => {
    if (notifications && notifications.length % limit !== 0) {
      setHasNextData(false);
    }
  }, [notifications]);

  return {
    notifications,
    loading,
    isNotLogin: error?.graphQLErrors[0]?.extensions?.code === 'FORBIDDEN',
    noData,
    hasNextData,
    ref,
  };
};
