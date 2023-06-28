export default function isMobile() {
  var user = navigator.userAgent;
  var is_mobile = false;

  if (
    user.indexOf("iPhone") > -1 ||
    user.indexOf("Android") > -1 ||
    user.indexOf("iPad") > -1 ||
    user.indexOf("iPod") > -1
  ) {
    is_mobile = true;
  }

  return is_mobile;
}
