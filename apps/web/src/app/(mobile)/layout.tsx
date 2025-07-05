import BottomNav from '@/components/layout/BottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav type={''} />
    </>
  );
}
