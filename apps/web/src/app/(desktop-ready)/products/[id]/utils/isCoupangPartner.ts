export const isCoupangPartner = (mallName?: string | null) => {
  if (!mallName) {
    return false;
  }

  return mallName.includes('쿠팡') || mallName.includes('coupang');
};
