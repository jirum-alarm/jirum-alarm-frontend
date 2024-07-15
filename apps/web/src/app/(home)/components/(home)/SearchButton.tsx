import { Search } from '@/components/common/icons';
import React from 'react';

interface Props {
  color?: string;
}

const SearchButton = ({ color }: Props) => {
  return (
    <button className="-m-2 p-2">
      <Search color={color} />
    </button>
  );
};

export default SearchButton;
