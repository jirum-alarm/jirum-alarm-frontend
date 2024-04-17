export function isIOSFlutterWeb() {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return navigator.userAgent.includes('IOS jirum_alarm_flutter');
}
