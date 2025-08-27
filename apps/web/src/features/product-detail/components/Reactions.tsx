'use client';

import Option from '@/components/common/icons/Option';
import Price from '@/components/common/icons/Price';
import Shop from '@/components/common/icons/Shop';
import Tip from '@/components/common/icons/Tip';
import { ProductCommentSummary } from '@/shared/api/gql/graphql';

const SUMMARY_DATA: {
  id: keyof ProductCommentSummary;
  title: string;
  icon: React.ReactNode;
}[] = [
  { id: 'price', title: '핫딜 가격', icon: <Price /> },
  { id: 'satisfaction', title: '만족도', icon: <Shop /> },
  { id: 'option', title: '옵션 및 사이즈', icon: <Option /> },
  { id: 'additionalInfo', title: '구매 팁', icon: <Tip /> },
];

export function Reactions({ commentSummary }: { commentSummary: ProductCommentSummary }) {
  return (
    <section className="rounded-lg bg-gray-50 p-4">
      <ul className="space-y-2">
        {commentSummary &&
          SUMMARY_DATA.map((item) => {
            const value = commentSummary?.[item.id];
            if (!value) return null;
            return (
              <li key={item.id}>
                <div className="flex items-center gap-x-1 pb-1">
                  {item.icon}
                  <span className="font-medium text-gray-900">{item.title}</span>
                </div>
                <span className="text-sm text-gray-600">{value}</span>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
