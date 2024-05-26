import DefaultLayout from '@/components/Layouts/DefaultLayout';
import NegativeKeywords from './components/NegativeKeywords';
import PositiveKeywords from './components/PositiveKeywords';

const PrimaryKeywords = () => {
  return (
    <DefaultLayout>
      <div className="flex gap-3">
        <PositiveKeywords />
        <NegativeKeywords />
      </div>
    </DefaultLayout>
  );
};

export default PrimaryKeywords;
