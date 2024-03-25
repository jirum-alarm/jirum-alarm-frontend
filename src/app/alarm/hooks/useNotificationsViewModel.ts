import { INotification } from '@/graphql/interface';
import { QueryNotifications } from '@/graphql/notification';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const offset = 0;
const limit = 20;

export const useNotificationsViewModel = () => {
  const [hasNextData, setHasNextData] = useState(true);

  const {
    data: { notifications } = { notifications: [] },
    loading,
    fetchMore,
  } = useQuery<{ notifications: INotification[] }>(QueryNotifications, {
    variables: { offset, limit },
  });

  const noData = !loading && notifications.length === 0;

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextData) {
        fetchMore({
          // @TODO: 추가 api 요청에 필요한 offset을 variables에 넘겨줘여함
          // 백엔드 api에 맞게 차후 수정 필요
          variables: {},
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
    noData,
    hasNextData,
    ref,
  };
};
