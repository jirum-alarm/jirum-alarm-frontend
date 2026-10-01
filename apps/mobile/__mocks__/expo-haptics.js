// 진동은 네이티브 전용 — 테스트에선 아무것도 안 한다(토스트·찜이 부른다).
const noop = () => Promise.resolve();
module.exports = {
  selectionAsync: noop,
  impactAsync: noop,
  notificationAsync: noop,
  ImpactFeedbackStyle: {Light: 'light', Medium: 'medium', Heavy: 'heavy'},
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
};
