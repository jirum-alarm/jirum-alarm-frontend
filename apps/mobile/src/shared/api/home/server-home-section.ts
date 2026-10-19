/** 홈 SDUI 서버 응답의 섹션 한 칸(재귀). 서비스·매퍼가 같이 쓴다. */
export type ServerHomeSection = {
  id: string;
  title: string;
  type: string;
  displayOrder?: number | null;
  viewMoreLink?: string | null;
  dataSource?: {
    type: string;
    queryName: string;
    variables?: Record<string, unknown> | null;
  } | null;
  tabs?: Array<{
    id: string;
    label: string;
    variables?: Record<string, unknown> | null;
    viewMoreLink?: string | null;
  }> | null;
  sections?: ServerHomeSection[] | null;
};
