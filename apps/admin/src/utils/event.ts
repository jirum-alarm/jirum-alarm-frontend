export const handleKeydownEnter = (callback: () => void) => {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    callback();
  };
};
