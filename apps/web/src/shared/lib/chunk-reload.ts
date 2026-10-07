/**
 * 배포 중 JS 조각(_next/static) 로드 실패 → 한 번 새로고침해 복구하는 인라인 스크립트(<head> 맨 앞).
 *
 * 왜: 웹 파드는 롤링 업데이트라 반영 중엔 신·구 파드가 섞인다. HTML 은 새 파드, 그 HTML 이 부르는
 * 조각은 옛 파드(그 파일 없음 → 404)로 가면 "Application error" 로 죽는다(2026-10-07 v1.50.0 반영 중 실측:
 * ChunkLoadError app/layout). 배포 전에 열어 둔 탭이 나중에 옛 조각을 찾는 것도 같은 모양.
 * React 가 그리기 전에 터지기도 해서 error boundary 로는 못 잡는다 — 리소스 error 이벤트를 캡처 단계에서 본다.
 *
 * ponytail: 새로고침 복구일 뿐 근본은 아니다. 조각을 S3/CDN 에 버전별로 쌓아 assetPrefix 로 내주면
 * 404 자체가 없어진다(CI 에 AWS 자격증명·버킷 필요). 30초 안에 2번까지만 — 진짜 깨진 조각이면 무한 새로고침 대신 에러 화면.
 */
export const CHUNK_RELOAD_SCRIPT = `(function(){
var K='jirum-chunk-reload',W=30000,MAX=2;
function reload(){
  try{
    var now=Date.now(),hist=JSON.parse(sessionStorage.getItem(K)||'[]').filter(function(t){return now-t<W;});
    if(hist.length>=MAX)return;
    hist.push(now);sessionStorage.setItem(K,JSON.stringify(hist));
  }catch(e){return;}
  location.reload();
}
window.addEventListener('error',function(e){
  var t=e.target,u=t&&(t.src||t.href);
  if(u&&(t.tagName==='SCRIPT'||t.tagName==='LINK')&&u.indexOf('/_next/static/')!==-1)reload();
},true);
window.addEventListener('unhandledrejection',function(e){
  var r=e.reason;
  if(r&&/ChunkLoadError|Loading (CSS )?chunk/.test((r.name||'')+' '+(r.message||'')))reload();
});
})();`;
