'use client';

import { useRouter } from 'next/navigation';

import { useToast } from '@/components/Toast';
import { useAddKeywordMapGroup } from '@/hooks/graphql/keywordMap';

import GroupForm from '../../components/GroupForm';

const GroupRegister = () => {
  const router = useRouter();
  const toast = useToast();
  const [mutate, { loading }] = useAddKeywordMapGroup({
    onCompleted: () => {
      toast.success('그룹이 등록되었습니다.');
      router.push('/keyword-map');
    },
    onError: (e) => toast.error(`등록 실패: ${e.message}`),
  });

  return (
    <GroupForm
      submitLabel="등록"
      loading={loading}
      onSubmit={({ name, description }) =>
        mutate({ variables: { name, description: description || undefined } })
      }
    />
  );
};

export default GroupRegister;
