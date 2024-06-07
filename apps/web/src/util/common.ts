export const goBackHandler = () => {
  if (document.referrer && document.referrer.includes('jirum-alarm.com')) {
    history.back();
  } else {
    location.href = '/';
  }
};
