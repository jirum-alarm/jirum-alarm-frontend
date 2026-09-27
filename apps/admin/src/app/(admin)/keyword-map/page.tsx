import Link from 'next/link';

import KeywordMapGroupsTable from './components/KeywordMapGroupsTable';

const KeywordMapPage = async () => {
  return (
    <>
      <div className="flex w-full justify-end">
        <Link className="mb-2 rounded-xl bg-lime-400 p-2 text-white" href={'/keyword-map/register'}>
          그룹 추가
        </Link>
      </div>
      <div className="flex gap-3">
        <KeywordMapGroupsTable />
      </div>
    </>
  );
};

export default KeywordMapPage;
