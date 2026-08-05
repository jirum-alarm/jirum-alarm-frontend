import Image from 'next/image';

/**
 * PC(비모바일) 전용 앱 설치 QR.
 *
 * PC에서 스토어 버튼을 누르면 데스크톱 웹 스토어가 열려 설치로 이어지지 않는다.
 * QR은 /app 으로 착지하고, 거기서 스캔한 폰의 UA를 보고 스토어를 분기한다.
 * (플랫폼별 QR 2개를 그리지 않는 이유 → src/app/app/route.ts)
 *
 * compact(모달 320px)만 세로 배치인 이유: 가로로 두면 텍스트 가용폭이 140px뿐이라
 * 문구가 2줄로 깨진다. 세로면 254px까지 벌어져 같은 문구를 양쪽에서 쓸 수 있다(실측).
 */
export default function AppDownloadQr({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex w-full rounded-xl bg-gray-50 ${
        compact
          ? 'flex-col items-center gap-y-3 px-4 py-4 text-center'
          : 'items-center gap-x-4 px-5 py-4'
      }`}
    >
      <Image
        src="/images/app-qr.png"
        alt="지름알림 앱 설치 QR 코드"
        width={compact ? 96 : 104}
        height={compact ? 96 : 104}
        className="shrink-0 rounded-md border border-gray-200 bg-white p-1.5"
      />
      <div className={compact ? '' : 'text-left'}>
        <p className="pb-1 font-semibold text-gray-900">카메라로 스캔해보세요</p>
        <p className="text-sm text-gray-500">앱을 통해 알림을 받을 수 있어요</p>
      </div>
    </div>
  );
}
