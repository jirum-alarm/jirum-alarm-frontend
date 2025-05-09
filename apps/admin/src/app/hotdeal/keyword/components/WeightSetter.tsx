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
      <form className="flex items-center gap-2">
        <label htmlFor="number-input" className="shrink-0 text-black dark:text-white">
          가중치 설정:
        </label>
        <input
          type="number"
          id="number-input"
          aria-describedby="helper-text-explanation"
          className="bg-gray-50 border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 block w-20 rounded-lg border p-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
          min={1}
          step={1}
          value={weight}
          onChange={handleWeightChange}
        />
      </form>
    </Card>
  );
};

export default WeightSetter;
