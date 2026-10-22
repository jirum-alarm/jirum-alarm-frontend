import { text } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import CurrentPasswordForm from './CurrentPasswordForm';

interface CurrentPasswordProps {
  nextStep: () => void;
}

const CurrentPassword = ({ nextStep }: CurrentPasswordProps) => {
  return (
    <div className="pc:pt-0 flex h-full flex-col px-5 pt-22 pb-9">
      <p className={cn(text.display, 'pc:text-sm pc:font-normal pc:text-gray-700')}>
        확인을 위해 현재 비밀번호를 <br className="pc:hidden" />
        입력해주세요.
      </p>
      <CurrentPasswordForm nextStep={nextStep} />
    </div>
  );
};

export default CurrentPassword;
