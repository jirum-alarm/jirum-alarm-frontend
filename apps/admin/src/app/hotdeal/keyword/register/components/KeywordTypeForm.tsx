import React from 'react';

import Card from '@/components/Card';
import { HotDealKeywordType } from '@/types/keyword';

import RadioButton from './RadioButton';

const TypeList = [
  {
    type: '긍정',
    value: HotDealKeywordType.POSITIVE,
  },
  {
    type: '부정',
    value: HotDealKeywordType.NEGATIVE,
  },
];

interface Props {
  onChangeKeywordType?: (type: HotDealKeywordType) => void;
  keywordType: HotDealKeywordType;
}

const KeywordTypeForm = ({ keywordType, onChangeKeywordType }: Props) => {
  const handleTypeChange = (value: string) => {
    const type = value as HotDealKeywordType;
    onChangeKeywordType?.(type);
  };
  return (
    <Card>
      <div>
        <fieldset>
          <legend className="mb-3 block text-xl font-medium text-black dark:text-white">
            유형
          </legend>
          {TypeList.map((type, i) => (
            <RadioButton
              key={i}
              name="keywordType"
              text={type.type}
              value={type.value}
              checked={keywordType === type.value}
              onChange={handleTypeChange}
              id={type.type}
            />
          ))}
        </fieldset>
      </div>
    </Card>
  );
};

export default KeywordTypeForm;
