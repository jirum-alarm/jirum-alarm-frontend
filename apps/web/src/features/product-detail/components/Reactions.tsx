'use client';

import { ProductCommentSummary } from '@/shared/api/gql/graphql';

const SUMMARY_DATA: {
  id: keyof ProductCommentSummary;
  title: string;
}[] = [
  { id: 'price', title: '핫딜 가격' },
  { id: 'satisfaction', title: '만족도' },
  { id: 'option', title: '옵션 및 사이즈' },
  { id: 'additionalInfo', title: '구매 팁' },
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
                  <span className="inline-block size-1 rounded-full bg-gray-500" />
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
