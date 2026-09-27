import DefaultLayout from '@/components/Layouts/DefaultLayout';

// 로그인 뒤 모든 화면의 공통 틀. 토큰 유무는 미들웨어가 이미 보장한다(없으면 /auth/signin 으로 보냄)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
