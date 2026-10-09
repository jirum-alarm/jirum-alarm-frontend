import React from 'react';

import Card from '@/components/Card';
import { HotDealKeywordTypeMap } from '@/constants/hotdeal';
import { HotDealKeywordType } from '@/types/keyword';

interface Props {
  keyword?: string;
  weight?: number;
  type?: HotDealKeywordType;
}

const KeywordDetailInfo = ({ keyword, weight, type }: Props) => {
  const ketwordTypeClasses =
    type === HotDealKeywordType.POSITIVE
      ? 'bg-success/10 text-success'
      : type === HotDealKeywordType.NEGATIVE
        ? 'bg-danger/10 text-danger'
        : '';
  return (
    <Card>
      <ul className="flex flex-col gap-2">
        <li>
          키워드 : <span className={`font-bold text-black`}>{keyword}</span>
        </li>
        <li>
          가중치 : <span className="font-bold text-black">{weight}</span>
        </li>

        {/* <li>유형 : {type && HotDealKeywordTypeMap[type]}</li> */}
        <li>
          <span>유형 : </span>
          <p
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${ketwordTypeClasses}`}
          >
            {type && HotDealKeywordTypeMap[type]}
          </p>
        </li>
      </ul>
    </Card>
  );
};

export default KeywordDetailInfo;
