import { Search } from '@/components/common/icons';
import Link from 'next/link';
import React from 'react';

interface Props {
  color?: string;
  onClick?: () => void;
}

const SearchLinkButton = ({ color, onClick }: Props) => {
  return (
    <Link className="-m-2 p-2" href={'/search'} onClick={onClick}>
      <Search color={color} />
    </Link>
  );
};

export default SearchLinkButton;
