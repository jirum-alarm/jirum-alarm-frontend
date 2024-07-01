import Signin from './components/Signin';

const SignInPage = async () => {
  return (
    <div className="flex h-screen w-full items-center justify-center p-5">
      <div className="h-fit w-full max-w-[500px]">
        <Signin />
      </div>
    </div>
  );
};

export default SignInPage;
