'use client';

import { ProductCommentSummary } from '@/shared/api/gql/graphql';
import { AIIcon } from '@/shared/ui/icons';
import Etc from '@/shared/ui/icons/Etc';
import Option from '@/shared/ui/icons/Option';
import Price from '@/shared/ui/icons/Price';
import Shop from '@/shared/ui/icons/Shop';
import Tip from '@/shared/ui/icons/Tip';

const SUMMARY_DATA: {
  id: keyof ProductCommentSummary;
  title: string;
  icon: React.ReactNode;
}[] = [
  { id: 'summary', title: '핫딜 추천 이유', icon: <AIIcon /> },
  { id: 'price', title: '핫딜 가격', icon: <Price /> },
  { id: 'satisfaction', title: '만족도', icon: <Shop /> },
  { id: 'option', title: '옵션 및 사이즈', icon: <Option /> },
  { id: 'purchaseMethod', title: '구매 팁', icon: <Tip /> },
  { id: 'additionalInfo', title: '기타', icon: <Etc /> },
];

export function Reactions({ commentSummary }: { commentSummary: ProductCommentSummary }) {
  return (
    <section className="rounded-lg bg-gray-50 p-4">
      <ul className="space-y-4">
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
