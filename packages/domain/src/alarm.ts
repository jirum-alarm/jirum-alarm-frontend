/**
 * 알림함 — 줄 배지·안내 줄·편집 버튼·빈 상태·「핫딜만 받기」 권유 문구. web(AlarmList·AlarmItem·NoAlerts)과
 * 앱(알림 탭)이 같이 쓴다. 전엔 두 앱이 따로 적고 앱 테스트가 web 파일을 읽어 문구를 대조했다(2026-10-20 정본화).
 * 줄 모양(읽음·안 읽음)은 디자인 시스템 notificationRow 가 정본이다.
 */
export const ALARM_COPY = {
  soldOut: '판매종료',
  hotDeal: '핫딜',
  promo: '지금 다양한 핫딜 알림을 받아보세요!',
  keywordSettings: '키워드 알림',
  deleteAll: '전체 삭제',
  done: '완료',
  emptyTitle: '아직 도착한 알림이 없어요',
  emptyBody: '키워드를 등록하고 알림을 받아보세요.',
  emptyCta: '키워드 등록',
  hotDealOnly: '핫딜만 받기',
  hotDealOnlyToast: '이제 핫딜이 된 딜만 알려드려요. 알림 설정에서 되돌릴 수 있어요',
} as const;
