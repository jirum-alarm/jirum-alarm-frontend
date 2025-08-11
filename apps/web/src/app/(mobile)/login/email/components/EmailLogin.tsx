import EmailLoginForm from './EmailLoginForm';

const EmailLogin = () => {
  return (
    <div className="px-5 pt-9 pb-5">
      <Description />
      <EmailLoginForm />
    </div>
  );
};

export default EmailLogin;

const Description = () => {
  return (
    <p className="text-2xl font-semibold">
      이메일과 비밀번호를
      <br />
      입력해주세요.
    </p>
  );
};
