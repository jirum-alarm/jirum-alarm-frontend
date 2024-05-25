'use client';
import { useEffect, useState } from 'react';
import Card from './Card';
import TypingEffectContainer from './TypingEffectContainer';

const KeywordResult = () => {
  const [text, setText] = useState('');
  useEffect(() => {
    setTimeout(() => {
      setText(
        `덕분에 잘 샀어요 \n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가\n바로샀네요\n너무좋아요\n초특가`,
      );
    }, 1000);
  });
  return (
    <Card>
      <label className="mb-3 block text-base font-medium text-black dark:text-white">
        매칭된 결과
      </label>

      <div>
        <TypingEffectContainer text={text} />
      </div>
    </Card>
  );
};

export default KeywordResult;
