'use client';
import Card from '@/components/Card';
import { useState } from 'react';

const WeightSetter = () => {
  const [weight, setWeight] = useState(1);
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setWeight(Number(value));
  };
  return (
    <Card>
      <div className="black">
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
