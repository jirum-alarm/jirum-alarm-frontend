import Button from '@/components/common/Button';
import BasicLayout from '@/components/layout/BasicLayout';
import KeywordInput from './components/KeywordInput';
import KeywordList from './components/KeywordList';

const KeywordPage = () => {
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="relative h-full px-5 py-6">
        <KeywordInput />
        <div className=" h-10" />
        <KeywordList />
      </div>
    </BasicLayout>
  );
};

export default KeywordPage;
