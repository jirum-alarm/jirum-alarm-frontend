'use client';
import withAuthValid from '@/components/hoc/withAuthValid';

interface MypageLayoutProps {
  children: React.ReactNode;
}

const MypageLayout = ({ children }: MypageLayoutProps) => {
  return <>{children}</>;
};

export default withAuthValid(MypageLayout);
