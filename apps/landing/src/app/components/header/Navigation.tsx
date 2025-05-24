import Link from 'next/link';

const Navigation = () => (
  <div className="flex items-center gap-3">
    <Link href="https://jirum-alarm.com/login" target="_blank">
      <button className="rounded-full bg-gray-900 px-4 py-1.5 font-semibold text-white">
        로그인
      </button>
    </Link>
    <Link href="https://jirum-alarm.com/signup" target="_blank" className="hidden lg:block">
      <button className="bg-primary-500 rounded-full px-4 py-1.5 font-bold">회원가입</button>
    </Link>
  </div>
);

export default Navigation;
