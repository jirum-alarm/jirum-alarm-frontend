import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type SynonymChips = {
  text: string;
  isChecked: boolean;
  isSaved: boolean;
};

type SynonymType = 'synonym' | 'exclude-synonym';

const useSynonymManager = (type: SynonymType) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [synonyms, setSynonyms] = useState<SynonymChips[]>([]);
  // 체크한 칩이 있으면 그것만, 없으면 전부 — synonyms 에서 파생되는 값이라 렌더 중에 계산한다.
  const filteredSynonyms = useMemo(() => {
    const activeSynonym = synonyms.filter((chip) => chip.isChecked);
    return (activeSynonym.length === 0 ? synonyms : activeSynonym).map((synonym) => synonym.text);
  }, [synonyms]);

  useEffect(() => {
    // if (typeof window === 'undefined') return;
    // const querysynonyms = searchParams.getAll(type);
    // const parsedSynonyms = querysynonyms.map((synonym) => {
    //   const [text, isChecked] = synonym.split(':');
    //   return { text, isChecked: isChecked === 'true', isSaved: false };
    // });
    // setSynonyms(parsedSynonyms);
  }, [searchParams, type]);

  const syncSavedSynonymsToState = (textList: string[]) => {
    setSynonyms(textList.map((text) => ({ text, isChecked: false, isSaved: true })));
  };

  const addQueryString = (text: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams);
    params.append(type, `${text}:${isChecked}`);
    router.replace(`${pathname}/?${params.toString()}`);
  };

  const updateQueryString = (text: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams);
    const values = params.getAll(type);
    params.delete(type);
    values.filter((val) => !val.startsWith(`${text}:`)).forEach((val) => params.append(type, val));
    params.append(type, `${text}:${isChecked}`);
    router.replace(`${pathname}/?${params.toString()}`);
  };

  const deleteQueryString = (text: string) => {
    const params = new URLSearchParams(searchParams);
    const values = params.getAll(type);
    params.delete(type);
    values.filter((val) => !val.startsWith(`${text}:`)).forEach((val) => params.append(type, val));
    router.replace(`${pathname}/?${params.toString()}`);
  };

  const onAddSynonym = (text: string) => {
    if (synonyms.some((synonym) => synonym.text === text)) {
      console.log('해당 키워드가 존재합니다.');
      return;
    }
    // addQueryString(text, false);
    const _synonyms = synonyms.concat({ text: text, isChecked: false, isSaved: false });
    setSynonyms(_synonyms);
  };

  const handleRemoveSynonym = (text: string) => {
    // deleteQueryString(text);
    const remainingSynonyms = synonyms.filter((synonym) => synonym.text !== text);
    setSynonyms(remainingSynonyms);
  };

  const handleToggleSynonymActive = (text: string) => {
    const _synonyms = synonyms.map((synonym) => {
      const isChecked = synonym.text === text ? !synonym.isChecked : synonym.isChecked;
      // if (synonym.text === text) {
      //   updateQueryString(synonym.text, isChecked);
      // }
      return {
        text: synonym.text,
        isChecked,
        isSaved: synonym.isSaved,
      };
    });
    setSynonyms(_synonyms);
  };

  const onReset = () => {
    router.replace(pathname);
  };

  return {
    synonyms,
    syncSavedSynonymsToState,
    onAddSynonym,
    handleRemoveSynonym,
    handleToggleSynonymActive,
    filteredSynonyms,
    onReset,
  };
};

export default useSynonymManager;
