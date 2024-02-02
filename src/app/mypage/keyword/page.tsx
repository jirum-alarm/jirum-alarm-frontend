'use client';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Close } from '@/components/common/icons';
import BasicLayout from '@/components/layout/BasicLayout';

const KeywordPage = () => {
  return (
    <BasicLayout hasBackButton title="키워드 알림">
      <div className="relative h-full px-5 py-6">
        <Input placeholder="키워드를 입력해주세요." />
        <div className=" h-10" />
        <div>
          <div className="flex justify-between text-sm font-medium text-gray-900">
            <span>나의 지름 키워드</span>
            <p>
              <span className="text-primary-500">3</span>
              <span>/</span>
              <span>20</span>
            </p>
          </div>
        </div>
        <div className=" h-4" />
        <ul>
          <li className="border-b border-gray-200 px-2 py-3">
            <div className="flex w-full items-center justify-between">
              <span className=" text-sm text-gray-900">키워드1</span>
              <button className="-m-2  p-2 text-gray-400">
                <Close width={20} height={20} />
              </button>
            </div>
          </li>
          <li className="border-b border-gray-200 px-2 py-3">
            <div className="flex w-full items-center justify-between">
              <span className=" text-sm text-gray-900">키워드2</span>
              <button className="-m-2  p-2 text-gray-400">
                <Close width={20} height={20} />
              </button>
            </div>
          </li>
          <li className="border-b border-gray-200 px-2 py-3">
            <div className="flex w-full items-center justify-between">
              <span className=" text-sm text-gray-900">키워드3</span>
              <button className="-m-2  p-2 text-gray-400">
                <Close width={20} height={20} />
              </button>
            </div>
          </li>
        </ul>
        <div className="fixed bottom-0 left-0 right-0 m-auto max-w-[480px] bg-white px-5 py-6">
          <Button className="w-full">등록</Button>
        </div>
      </div>
    </BasicLayout>
  );
};

export default KeywordPage;
