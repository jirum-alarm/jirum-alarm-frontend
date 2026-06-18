import { ArrowRight } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

interface MovePageProps {
  to: string;
  title: string;
  subtitle?: string;
}

const MovePage = ({ to, title, subtitle }: MovePageProps) => {
  return (
    <Link href={to}>
      <div className="flex justify-between py-3">
        <div>
          <span className="text-fg-muted typography-body-14r">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {subtitle && <span className="text-fg-primary typography-body-14r"> {subtitle}</span>}
          <ArrowRight />
        </div>
      </div>
    </Link>
  );
};

export default MovePage;
