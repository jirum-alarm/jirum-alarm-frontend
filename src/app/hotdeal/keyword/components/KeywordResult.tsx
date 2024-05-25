'use client';
import { useEffect, useState } from 'react';
import Card from './Card';
import TypingEffectContainer from './TypingEffectContainer';

const texte = `덕분에 잘 샀어요 \n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가`;

const KeywordResult = () => {
  const [text, setText] = useState('');
  useEffect(() => {
    setTimeout(() => {
      setText(texte);
    }, 1000);
  }, []);

  return (
    <Card>
      <h2 className="mb-3 block text-xl font-medium text-black dark:text-white">매칭된 결과</h2>
      <div>
        <TypingEffectContainer text={text} />
      </div>
    </Card>
  );
};

export default KeywordResult;
