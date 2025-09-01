export const isCoupangPartner = (url?: string | null) => {
  if (!url) {
    return false;
  }

  return url.includes('coupang.com');
};
