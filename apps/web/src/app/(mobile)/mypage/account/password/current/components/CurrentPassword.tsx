import CurrentPasswordForm from './CurrentPasswordForm';

interface CurrentPasswordProps {
  nextStep: () => void;
}

const CurrentPassword = ({ nextStep }: CurrentPasswordProps) => {
  return (
    <div className="flex h-full flex-col px-5 pb-9 pt-22">
      <p className="text-2xl font-semibold text-gray-900">
        확인을 위해 현재 비밀번호를
        <br />
        입력해주세요.
      </p>
      <CurrentPasswordForm nextStep={nextStep} />
    </div>
  );
};

export default CurrentPassword;
