/**
 * 상세 진입 시 즉시 뜨는 뼈대.
 *
 * 이게 없으면 Next 는 서버 응답이 올 때까지 **이전 화면에 그대로 머문다** —
 * 목록에서 상품을 눌렀는데 아무 반응이 없다가 화면이 통째로 바뀐다.
 * loading.tsx 가 있으면 클릭 즉시 전환되고 본문만 뼈대로 채워진다.
 * (헤더·바텀네비는 layout 이 이미 그리고 있어 그대로 남는다)
 *
 * ⚠️ 빈 화면(`return null`)을 반환하면 안 된다. 전환은 즉시라도 흰 화면이
 * 보이므로, 실제 레이아웃과 같은 자리·같은 높이를 잡아 줘야 한다.
 */
export default function ProductDetailLoading() {
  return (
    <div className="mx-auto w-full animate-pulse" aria-hidden="true">
      {/* 대표 이미지 — 정사각. 실제 이미지와 같은 비율이라 도착해도 안 밀린다 */}
      <div className="aspect-square w-full bg-gray-100" />

      <div className="px-5 pt-4">
        {/* 제목 2줄 */}
        <div className="h-5 w-full rounded-sm bg-gray-100" />
        <div className="mt-2 h-5 w-3/5 rounded-sm bg-gray-100" />

        {/* 게시 시각 */}
        <div className="mt-3 h-3.5 w-20 rounded-sm bg-gray-100" />

        {/* 가격 */}
        <div className="mt-4 h-8 w-32 rounded-sm bg-gray-100" />

        {/* 쇼핑몰 */}
        <div className="mt-3 h-4 w-16 rounded-sm bg-gray-100" />

        {/* 카톡방 안내 배너 */}
        <div className="mt-5 h-16 w-full rounded-lg bg-gray-100" />

        {/* 커뮤니티 반응 */}
        <div className="mt-6 h-5 w-28 rounded-sm bg-gray-100" />
        <div className="mt-3 h-24 w-full rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}
