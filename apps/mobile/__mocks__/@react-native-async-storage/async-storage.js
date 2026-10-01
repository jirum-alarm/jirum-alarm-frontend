// 공식 목 — 메모리 저장소. 화면 캐시(query-cache)처럼 직접 import 하는 모듈이 테스트에서 로드되게.
module.exports = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
