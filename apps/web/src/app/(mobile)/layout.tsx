import BottomNav from '@/components/layout/BottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full min-h-screen bg-white">
      {children}
      <BottomNav />
    </div>
  );
}
