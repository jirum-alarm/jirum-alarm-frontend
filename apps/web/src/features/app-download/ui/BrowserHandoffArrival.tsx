'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';

import useAlertSession from '@/shared/hooks/useAlertSession';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { readHandoff } from '@/shared/lib/push-channel/browserHandoff';
import { readPushStatus } from '@/shared/lib/push-channel/pushChannel';
import { BottomSheetContent } from '@/shared/ui/common/BottomSheet';
import { useToast } from '@/shared/ui/common/Toast';

const DEVICE_ID_KEY = 'jirum-alarm-device-id';

function pushEvent(event: string, props: Record<string, unknown> = {}) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement: 'handoff_arrive',
    ...props,
  });
}

/**
 * 인앱 브라우저에서 넘어온 사람(?gd=기기id&push=1)을 같은 게스트로 이어받고 「알림 켜기」를 묻는다.
 * 넘기는 쪽은 상세 첫 방문 시트(FirstVisitAlertSheet). 권한 요청은 사용자 탭이 있어야 해서 버튼으로 받는다.
 *
 * 로그인돼 있으면 기기 id 를 이어받지 않는다 — 이 브라우저의 회원 세션이 우선이다.
 * 계측: keyword_prompt_view/click(placement=handoff_arrive) — 넘기기 클릭 대비 도착 비율로
 * 네이버 앱이 intent 를 실제로 기본 브라우저로 넘기는지 판정한다(실기기로 못 시험했다, 2026-10-09).
 */
export default function BrowserHandoffArrival() {
  const { isLoggedIn } = useIsLoggedIn();
  const { ensureAlertSession } = useAlertSession();
  const { requestPermission } = useFcmPermission();
  const { toast } = useToast();
  const router = useRouter();
  const [askPush, setAskPush] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const { deviceId, wantsPush, cleanUrl } = readHandoff(window.location.href);
    if (!deviceId) return;
    // 주소창·공유 링크에 기기 id 가 남지 않게 지운다. history.replaceState 는 Next 라우터가 곧바로 자기 URL 로
    // 되돌려서(2026-10-09 실측) 라우터로 바꾼다 — 넘어온 직후 한 번이라 페이지 재요청 비용은 감수한다.
    router.replace(cleanUrl, { scroll: false });
    pushEvent('keyword_prompt_view');

    void (async () => {
      if (!isLoggedIn) {
        try {
          localStorage.setItem(DEVICE_ID_KEY, deviceId);
        } catch {
          return;
        }
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${DEVICE_ID_KEY}=${deviceId}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
        if (!(await ensureAlertSession())) return;
      }
      if (wantsPush && readPushStatus() === 'default') setAskPush(true);
    })();
  }, [isLoggedIn, ensureAlertSession, router]);

  if (!askPush) return null;

  const handleEnable = async () => {
    pushEvent('keyword_prompt_click');
    const { granted } = await requestPermission({ force: true });
    if (granted) toast.success('알림을 켰어요. 새 핫딜이 오면 알려드릴게요.');
    setAskPush(false);
  };

  return (
    <Drawer.Root open onOpenChange={(open) => !open && setAskPush(false)}>
      <BottomSheetContent handle className="pb-safe-bottom-16 px-5">
        <Drawer.Title className="text-2xl font-semibold text-gray-900">
          마지막 단계예요
          <br />
          알림을 켜 주세요
        </Drawer.Title>
        <Drawer.Description className="pt-2 text-sm text-gray-500">
          이 브라우저로 핫딜 알림을 보내드려요.
        </Drawer.Description>
        <div className="mt-5 flex flex-col gap-y-2">
          <button
            type="button"
            onClick={handleEnable}
            className="bg-primary-500 text-fixed-900 h-12 w-full rounded-lg font-semibold"
          >
            알림 켜기
          </button>
          <button
            type="button"
            onClick={() => setAskPush(false)}
            className="h-10 text-sm text-gray-500"
          >
            다음에 할게요
          </button>
        </div>
      </BottomSheetContent>
    </Drawer.Root>
  );
}
