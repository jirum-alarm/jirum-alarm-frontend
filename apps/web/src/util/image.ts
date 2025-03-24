export const convertToWebp = (url?: string) => {
  return url?.replace(/\.[^.]+$/, '.webp');
};
