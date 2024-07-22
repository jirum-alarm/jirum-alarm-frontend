import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const useShowSearchPage = () => {
  const searchParams = useSearchParams();

  const [showSearchPage, setShowSearchPage] = useState(false);

  const isSearchPage = searchParams.has('search');

  // const goSearchPage = () => {
  //   history.pushState({}, '', '/?search');
  //   setShowSearchPage(true);
  // };

  useEffect(() => {
    if (isSearchPage) {
      setShowSearchPage(false);
    }
  }, [isSearchPage]);

  return {
    showSearchPage: isSearchPage || showSearchPage,
  };
};

export default useShowSearchPage;
