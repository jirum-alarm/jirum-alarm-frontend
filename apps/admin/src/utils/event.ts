/** Enter 키(한글 조합 중 제외)일 때만 callback 을 부른다. onKeyDown 핸들러 안에서 호출한다. */
export const handleKeydownEnter = (
  e: React.KeyboardEvent<HTMLInputElement>,
  callback: () => void,
) => {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
  callback();
};
