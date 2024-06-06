'use client';
import Card from '@/components/Card';
import { useAddHotDealKeyword } from '@/hooks/graphql/keyword';
import { HotDealKeywordType } from '@/types/keyword';
import { useState } from 'react';

const WeightSetter = () => {
  const [weight, setWeight] = useState(1);
  const [mutate] = useAddHotDealKeyword({
    onCompleted: () => {
      alert('등록 테스트!');
    },
  });
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setWeight(Number(value));
  };
  return (
    <Card>
      <div className="black">
        <button
          onClick={() =>
            mutate({
              variables: {
                type: HotDealKeywordType.POSITIVE,
                keyword: '좋아요',
                weight: 10,
                isMajor: true,
              },
            })
          }
        >
          등록?
        </button>
        <span>가중치 설정 : </span>
        <input
          type="number"
          className=" w-8"
          min={1}
          max={9}
          step={1}
          value={weight}
          onChange={handleWeightChange}
        />
      </div>
    </Card>
  );
};

export default WeightSetter;
