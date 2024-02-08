export interface Keyword {
  id: string;
  userId: number;
  keyword: string;
  isActive: boolean;
  createdAt: string;
}

export interface MypageKeyword {
  notificationKeywordsByMe: Pick<Keyword, 'id' | 'keyword'>[];
}
