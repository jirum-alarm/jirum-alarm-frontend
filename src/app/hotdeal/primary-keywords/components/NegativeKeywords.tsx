import Card from '@/components/Card';
import React from 'react';

const NegativeKeywords = () => {
  return (
    <Card
      title={<div className="px-4 py-2 text-lg text-graydark">부정목록</div>}
      disablePadding
      bgColor="bg-rose-400"
    >
      <ul className="bg-white text-black">
        <li className="border-b border-b-slate-200 px-4 py-2">비싸다</li>
        <li className="border-b border-b-slate-200 px-4 py-2 last:border-b-0">안사요</li>
      </ul>
    </Card>
  );
};

export default NegativeKeywords;
