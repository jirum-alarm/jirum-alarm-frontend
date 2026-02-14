import { BrandProduct } from '@/hooks/graphql/brandProduct';

export type { BrandProduct };

/** 검증 대기 항목 타입 (확장 필드 포함) */
export interface PendingVerificationItem {
  id: string;
  productId: number;
  brandProduct: string | null;
  product: {
    title: string;
    thumbnail?: string | null;
    price?: string | null;
    url?: string | null;
    provider?: { name: string } | null;
  } | null;
  danawaUrl: string | null;
  createdAt: string;
  searchAfter: string[] | null;
  isSelected: boolean;
  verificationStatus: string | null;
  verifiedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  verifiedAt: string | null;
  matchingConfidence: number | null;
  matchingReasoning: string | null;
}

/** Undo 스택 액션 */
export interface UndoAction {
  approvedIds: string[];
  rejectedIds: string[];
  brandProductId: string;
  previousSelections: Record<string, boolean>;
  previousStatuses: Record<string, string | null>;
  timestamp: number;
}

/** 토스트 상태 */
export interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

/** 이미지 비교 모달 상태 */
export interface ImageModalState {
  isOpen: boolean;
  danawaImage: string;
  danawaTitle: string;
  danawaUrl?: string;
  communityImage?: string;
  communityTitle: string;
}
