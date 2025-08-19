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
      className="pc:m-0 pc:size-8 pc:p-0 -m-2 p-2"
      href={PAGE.SEARCH}
      onClick={onClick}
      aria-label="검색"
    >
      <Search color={color} className="pc:size-8 size-6" />
    </Link>
  );
};

export default SearchLinkButton;
