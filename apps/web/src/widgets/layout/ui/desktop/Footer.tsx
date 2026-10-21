import Link from 'next/link';

import ColorSchemeButton from '@/shared/ui/ColorSchemeButton';
import { IllustIcons } from '@/shared/ui/common/icons';
import TalkLight from '@/shared/ui/common/icons/TalkLight';

// 해외직구 시즌 허브 — 사이트맵·IndexNow·llms.txt 에만 있고 HTML 링크가 0개라 10/22 GSC 에서 «알려지지 않은 URL» 이었다.
// 광군제(11/11) 전에 검색엔진이 찾도록 모든 PC 페이지·홈에서 거는 상시 크롤 경로. 시즌 끝(12/12, KST) 뒤엔 내린다.
const SEASON_HUB_UNTIL_KST = '2026-12-12';
const isSeasonHubLinkOn = () =>
  new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10) <= SEASON_HUB_UNTIL_KST;

const Footer = () => {
  return (
    <div className="relative flex w-full flex-col bg-gray-50">
      <div className="flex items-end">
        <footer className="max-w-8xl mx-auto flex w-full flex-1 flex-col justify-between px-5 py-15 lg:px-20 lg:py-12">
          <div className="mb-5 flex justify-between">
            <div className="flex items-center gap-x-2.5">
              <IllustIcons.IconLogo />
              <p className="text-2xl font-bold text-gray-900">지름알림</p>
            </div>
            {/* 비로그인은 GNB 내 메뉴가 없어 화면 모드를 여기서 바꾼다. */}
            <div className="flex items-center gap-x-3">
              <ColorSchemeButton color="var(--color-gray-900)" />
              <Link
                href="https://open.kakao.com/o/gJZTWAAg"
                target="_blank"
                aria-label="카카오톡 오픈채팅 바로가기"
                className="bg-kakao flex size-9 items-center justify-center rounded-full"
              >
                <TalkLight className="mt-0.5 mr-0.25" />
              </Link>
            </div>
          </div>
          <p className="mb-4 text-sm font-medium whitespace-pre-line text-gray-700">
            지름알림{'\n'}
            고객센터 :{' '}
            <Link href="mailto:jirumalarm@gmail.com" className="font-medium underline">
              jirumalarm@gmail.com
            </Link>
          </p>
          <div className="flex h-full flex-col justify-between lg:flex-row">
            {/* 링크가 6개라 폰 폭에선 칸마다 글자 단위로 꺾였다 — 링크 단위로 다음 줄로 넘긴다. */}
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm whitespace-nowrap text-gray-600">
              <Link href="https://jirum-alarm.com/policies/terms" className="underline">
                서비스 이용약관
              </Link>
              <span className="text-gray-400">ㅣ</span>
              <Link href="https://jirum-alarm.com/policies/privacy" className="underline">
                개인정보 처리방침
              </Link>
              <span className="text-gray-400">ㅣ</span>
              <Link href="/keywords" className="underline">
                키워드별 핫딜
              </Link>
              <span className="text-gray-400">ㅣ</span>
              {/* /deals 는 내부 링크 0개 고아 트리라 구글 미색인이었음(2026-07-20) — 메뉴에서 내린 뒤(10/17) 모든 PC 페이지에서 걸리는 상시 크롤 경로 */}
              <Link href="/deals" className="underline">
                핫딜 최저가 모음
              </Link>
              <span className="text-gray-400">ㅣ</span>
              {/* 사용법·차별점·FAQ — 모든 PC 페이지에서 걸리는 내부 링크(검색엔진이 따라가는 상시 경로). */}
              <Link href="/help" className="underline">
                지름알림이란 · 자주 묻는 질문
              </Link>
              {isSeasonHubLinkOn() && (
                <>
                  <span className="text-gray-400">ㅣ</span>
                  <Link href="/season/2026-black-friday" className="underline">
                    블프·광군제 직구 달력
                  </Link>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Copyright {new Date().getFullYear()}. 지름알림. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
