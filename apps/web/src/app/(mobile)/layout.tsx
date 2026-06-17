import BottomNav from '@/shared/ui/layout/BottomNav';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-default h-full min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}
