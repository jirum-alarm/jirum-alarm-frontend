import { Search } from '@/components/common/icons';
import Link from '@/features/Link';

interface Props {
  color?: string;
  onClick?: () => void;
}

const SearchLinkButton = ({ color, onClick }: Props) => {
  return (
    <Link className="-m-2 p-2" href={'/search'} onClick={onClick} aria-label="검색">
      <Search color={color} />
    </Link>
  );
};

export default SearchLinkButton;
