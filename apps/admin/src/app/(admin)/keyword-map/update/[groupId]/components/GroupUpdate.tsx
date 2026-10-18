'use client';

import { useRouter } from 'next/navigation';

import { useToast } from '@/components/Toast';
import { useGetKeywordMapGroup, useUpdateKeywordMapGroup } from '@/hooks/graphql/keywordMap';

import GroupForm from '../../../components/GroupForm';

interface Props {
  groupId: string;
}

const GroupUpdate = ({ groupId }: Props) => {
  const router = useRouter();
  const toast = useToast();
  const { data, loading: fetching } = useGetKeywordMapGroup({
    variables: { id: Number(groupId) },
  });

  const [mutate, { loading }] = useUpdateKeywordMapGroup({
    onCompleted: () => {
      toast.success('그룹이 수정되었습니다.');
      router.push('/keyword-map');
    },
    onError: (e) => toast.error(`수정 실패: ${e.message}`),
  });

  if (fetching) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 rounded-sm bg-gray-200" />
      </div>
    );
  }

  const group = data?.keywordMapGroupByAdmin;
  if (!group)
    return <div className="py-20 text-center text-bodydark2">그룹을 찾을 수 없습니다.</div>;

  return (
    <GroupForm
      // 다른 그룹으로 옮겨 오면 폼을 새로 채운다
      key={group.id}
      initial={{ name: group.name, description: group.description ?? '' }}
      submitLabel="수정"
      loading={loading}
      onSubmit={({ name, description }) =>
        mutate({
          variables: {
            id: Number(groupId),
            name,
            // undefined 는 서버 update 가 건너뛰어 설명을 비울 수 없다 — null 이어야 NULL 로 쓴다
            description: description || null,
          },
        })
      }
    />
  );
};

export default GroupUpdate;
