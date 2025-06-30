import Link from 'next/link';

const Navigation = () => (
  <div className="flex items-center gap-3">
    <Link
      href="https://jirum-alarm.com/login"
      target="_blank"
      className="rounded-full bg-gray-900 px-4 py-1.5 font-semibold text-white"
    >
      로그인
    </Link>
    <Link
      href="https://jirum-alarm.com/signup"
      target="_blank"
      className="bg-primary-500 hidden rounded-full px-4 py-1.5 font-bold lg:block"
    >
      회원가입
    </Link>
  </div>
);

export default Navigation;
