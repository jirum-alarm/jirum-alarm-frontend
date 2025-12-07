export const convertToWebp = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
};
