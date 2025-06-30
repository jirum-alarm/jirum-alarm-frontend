import BottomNavServer from '@/components/layout/BottomNavServer';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavServer />
    </>
  );
}
