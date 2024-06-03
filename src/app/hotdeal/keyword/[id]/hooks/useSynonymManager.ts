import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type SynonymChips = {
  text: string;
  isActive: boolean;
};

type SynonymType = 'synonym' | 'exclude-synonym';

const useSynonymManager = (type: SynonymType) => {
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

  useEffect(() => {
    const querysynonyms = searchParams.getAll(type);
    const parsedSynonyms = querysynonyms.map((synonym) => {
      const [text, isActive] = synonym.split(':');
      return { text, isActive: isActive === 'true' };
    });
    setSynonyms(parsedSynonyms);
  }, [searchParams, type]);

  const addQueryString = (text: string, isActive: boolean) => {
    const params = new URLSearchParams(searchParams);
    params.append(type, `${text}:${isActive}`);
    router.push(`${pathname}/?${params.toString()}`);
  };

  const updateQueryString = (text: string, isActive: boolean) => {
    const params = new URLSearchParams(searchParams);
    const values = params.getAll(type);
    params.delete(type);
    values.filter((val) => !val.startsWith(`${text}:`)).forEach((val) => params.append(type, val));
    params.append(type, `${text}:${isActive}`);
    router.push(`${pathname}/?${params.toString()}`);
  };

  const deleteQueryString = (text: string) => {
    const params = new URLSearchParams(searchParams);
    const values = params.getAll(type);
    params.delete(type);
    values.filter((val) => !val.startsWith(`${text}:`)).forEach((val) => params.append(type, val));
    router.push(`${pathname}/?${params.toString()}`);
  };

  const onAddSynonym = (text: string) => {
    if (synonyms.some((synonym) => synonym.text === text)) {
      console.log('해당 키워드가 존재합니다.');
      return;
    }
    addQueryString(text, false);
    const _synonyms = synonyms.concat({ text: text, isActive: false });
    setSynonyms(_synonyms);
  };

  const handleRemoveSynonym = (text: string) => {
    deleteQueryString(text);
    const remainingSynonyms = synonyms.filter((synonym) => synonym.text !== text);
    setSynonyms(remainingSynonyms);
  };

  const handleToggleSynonymActive = (text: string) => {
    const _synonyms = synonyms.map((synonym) => {
      const isActive = synonym.text === text ? !synonym.isActive : synonym.isActive;
      if (synonym.text === text) {
        updateQueryString(synonym.text, isActive);
      }
      return {
        text: synonym.text,
        isActive,
      };
    });
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
