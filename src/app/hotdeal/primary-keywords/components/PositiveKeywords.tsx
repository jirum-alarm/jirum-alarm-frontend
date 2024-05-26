import Card from '@/components/Card';
import Link from 'next/link';

const PositiveKeywords = () => {
  return (
    <Card
      title={<div className="px-4 py-2 text-lg text-graydark">긍정목록</div>}
      disablePadding
      bgColor="bg-green-200"
    >
      <ul className="bg-white text-black">
        <li className="border-b border-b-slate-200">
          <Link
            className="block h-full w-full px-4 py-2 hover:bg-slate-50"
            href="/hotdeal/primary-keywords/1"
          >
            사다
          </Link>
        </li>
        <li className="border-b border-b-slate-200 last:border-b-0">
          <Link
            className="block h-full w-full px-4 py-2 hover:bg-slate-50"
            href="/hotdeal/primary-keywords/1"
          >
            구매
          </Link>
        </li>
      </ul>
    </Card>
  );
};

export default PositiveKeywords;
