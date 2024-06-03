import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Card from '@/components/Card';
import WeightSetter from './components/WeightSetter';
import PrimaryKeyword from './components/PrimaryKeyword';

const KeywordRegister = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-2">
        <Card>
          <WeightSetter />
        </Card>
        <Card>
          <PrimaryKeyword />
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default KeywordRegister;
