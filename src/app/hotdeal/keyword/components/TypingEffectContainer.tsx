'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  speed?: number;
}
const TypingEffect = ({ text, speed = 50 }: Props) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!text) return;
    let index = 0;
    setDisplayedText('');
    setIsFinished(false);
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index += 1;
      if (index >= text.length) {
        clearInterval(intervalId);
        setIsFinished(true);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  return (
    <div
      className="no-scrollbar h-65 w-full overflow-scroll rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input"
      ref={containerRef}
    >
      {!text ? (
        <Cursor />
      ) : (
        <p className=" whitespace-pre">
          {displayedText}
          {!isFinished && <Cursor />}
        </p>
      )}
    </div>
  );
};

export default TypingEffect;

const Cursor = () => {
  return (
    <div className=" animate-blink ml-1 inline-block h-4 w-[2px] translate-y-[2px] bg-black" />
  );
};
