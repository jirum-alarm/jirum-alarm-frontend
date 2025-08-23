import { Search } from '@/components/common/icons';
import { PAGE } from '@/constants/page';

import Link from '@shared/ui/Link';

interface Props {
  color?: string;
  onClick?: () => void;
}

const SearchLinkButton = ({ color, onClick }: Props) => {
  return (
    <Link
      className="pc:m-0 pc:size-9 pc:p-0 pc:rounded-full pc:hover:bg-white/10 -m-2 flex items-center justify-center p-2 transition-colors duration-300"
      href={PAGE.SEARCH}
      onClick={onClick}
      aria-label="검색"
    >
      <Search color={color} className="pc:size-7 size-6" />
    </Link>
  );
};

export default SearchLinkButton;
