// expo-updates 는 ESM 이고 루트 node_modules 에 있어 jest 가 변환하지 못한다.
// 스토어 번들로 뜬 정상 실행처럼 보이게 둔다 — OTA 동작 자체는 ota-resume.test 가 자기 목으로 본다.
module.exports = {
  isEnabled: false,
  isEmbeddedLaunch: true,
  isEmergencyLaunch: false,
  emergencyLaunchReason: null,
  updateId: null,
  channel: null,
  checkForUpdateAsync: () => Promise.resolve({isAvailable: false}),
  fetchUpdateAsync: () => Promise.resolve({isNew: false}),
  reloadAsync: () => Promise.resolve(),
};
