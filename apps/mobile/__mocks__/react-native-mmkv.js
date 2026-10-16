// MMKV 목 — 같은 id 는 같은 메모리 저장소를 본다(실기기처럼).
// 실제 패키지는 import 만 해도 Nitro 네이티브 모듈을 찾으므로 jest 에선 이걸 쓴다.
const stores = new Map();

function createMMKV(config = {id: 'mmkv.default'}) {
  if (!stores.has(config.id)) stores.set(config.id, new Map());
  const storage = stores.get(config.id);
  const typed = type => key => {
    const v = storage.get(key);
    return typeof v === type ? v : undefined;
  };
  return {
    id: config.id,
    set: (key, value) => {
      storage.set(key, value);
    },
    getString: typed('string'),
    getBoolean: typed('boolean'),
    getNumber: typed('number'),
    contains: key => storage.has(key),
    remove: key => storage.delete(key),
    getAllKeys: () => [...storage.keys()],
    clearAll: () => storage.clear(),
  };
}

module.exports = {
  createMMKV,
  __resetAllMMKV: () => stores.clear(),
};
