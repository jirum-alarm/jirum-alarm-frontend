/**
 * 실험 배정 버킷 0~99 — 원본은 @jirum/domain experiment-bucket(web·서버와 같은 sha256 값).
 * 앱이 클라에서 정하는 실험도 해시는 반드시 이 함수여야 한다(분석은 서버가 deviceId 로 다시 계산).
 */
export {experimentBucket} from '@jirum/domain/experiment-bucket';
