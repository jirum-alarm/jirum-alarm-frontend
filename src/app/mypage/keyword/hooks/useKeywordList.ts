import { useToast } from '@/components/common/Toast';
import { MypageKeyword } from '@/graphql/interface/keyword';
import { MutationRemoveNotificationKeyword, QueryMypageKeyword } from '@/graphql/keyword';
import { useMutation } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';

export const useKeywordList = () => {
  const { data: { notificationKeywordsByMe } = {} } = useQuery<MypageKeyword>(QueryMypageKeyword, {
    variables: {
      limit: 20,
    },
  });
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
