'use client';
import Card from '@/components/Card';

interface Props {
  onChange: (value: number) => void;
  weight: number;
}

const WeightSetter = ({ onChange, weight }: Props) => {
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    onChange(Number(value));
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
