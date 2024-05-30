import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type SynonymChips = {
  text: string;
  isActive: boolean;
};

const SYNONYM = 'synonym';

const useSynonymManager = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [synonyms, setSynonyms] = useState<SynonymChips[]>([]);
  const [filteredSynonyms, setFilteredSynonyms] = useState<SynonymChips[]>();

  useEffect(() => {
    const activeSynonym = synonyms.filter((chip) => chip.isActive);
    if (activeSynonym.length === 0) {
      setFilteredSynonyms(synonyms);
    } else {
      setFilteredSynonyms(activeSynonym);
    }
  }, [synonyms]);

  // useEffect(() => {
  // const querysynonyms = searchParams.getAll(SYNONYM);
  // setSynonyms(querysynonyms);
  // }, [searchParams]);

  const updateSearchParams = (synonyms: SynonymChips[]) => {
    // const params = new URLSearchParams();
    // synonyms.forEach((k) => params.append(SYNONYM, k));
    // router.push(`${pathname}/?${params.toString()}`);
  };

  const onAddSynonym = (text: string) => {
    if (synonyms.some((synonym) => synonym.text === text)) {
      console.log('해당 키워드가 존재합니다.');
      return;
    }
    const _synonyms = synonyms.concat({ text: text, isActive: false });
    // updateSearchParams(_synonyms);
    setSynonyms(_synonyms);
  };

  const handleRemoveSynonym = (text: string) => {
    const remainingSynonyms = synonyms.filter((synonym) => synonym.text !== text);
    // updateSearchParams(filteredsynonyms);
    setSynonyms(remainingSynonyms);
  };

  const handleToggleSynonymActive = (text: string) => {
    const _synonyms = synonyms.map((synonym) => ({
      text: synonym.text,
      isActive: synonym.text === text ? !synonym.isActive : synonym.isActive,
    }));
    setSynonyms(_synonyms);
  };

  return {
    synonyms,
    onAddSynonym,
    handleRemoveSynonym,
    handleToggleSynonymActive,
    filteredSynonyms,
  };
};

export default useSynonymManager;
