import { useToast } from '@/components/common/Toast';
import { authQueries } from '@/entities/auth/auth.queries';
import { MutationRemoveNotificationKeyword, QueryMypageKeyword } from '@/graphql/keyword';
import { useMutation } from '@apollo/client';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useKeywordList = () => {
  const {
    data: { notificationKeywordsByMe },
  } = useSuspenseQuery(authQueries.myKeyword({ limit: 20 }));
  const { toast } = useToast();
  const [removeNotificationKeyword] = useMutation<
    { removeNotificationKeyword: boolean },
    { id: number }
  >(MutationRemoveNotificationKeyword, {
    refetchQueries: [{ query: QueryMypageKeyword, variables: { limit: 20 } }],
    onError: (error) => {
      toast(error.message);
    },
  });
  const onDeleteKeyword = (id: string) => {
    removeNotificationKeyword({
      variables: {
        id: Number(id),
      },
    });
  };
  return { notificationKeywordsByMe, onDeleteKeyword };
};
