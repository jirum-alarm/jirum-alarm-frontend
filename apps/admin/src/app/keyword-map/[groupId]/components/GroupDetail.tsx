'use client';

import Link from 'next/link';

import { useGetKeywordMapGroup } from '@/hooks/graphql/keywordMap';

import EntryManager from './EntryManager';
import GroupDetailInfo from './GroupDetailInfo';

interface Props {
  groupId: string;
}

const GroupDetail = ({ groupId }: Props) => {
  const { data, loading } = useGetKeywordMapGroup({
    variables: { id: Number(groupId) },
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 h-20 rounded" />
        <div className="bg-gray-200 h-40 rounded" />
      </div>
    );
  }

  if (!data?.keywordMapGroupByAdmin) {
    return <div className="text-gray-500 text-center">그룹을 찾을 수 없습니다.</div>;
  }

  const group = data.keywordMapGroupByAdmin;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link
          className="rounded-xl bg-slate-600 p-2 text-white"
          href={`/keyword-map/update/${groupId}`}
        >
          그룹 수정
        </Link>
      </div>
      <GroupDetailInfo name={group.name} description={group.description} />
      <EntryManager groupId={Number(groupId)} entries={group.entries} />
    </div>
  );
};

export default GroupDetail;
