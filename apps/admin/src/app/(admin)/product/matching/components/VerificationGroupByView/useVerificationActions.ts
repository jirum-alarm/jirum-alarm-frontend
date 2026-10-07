import { Dispatch, SetStateAction, useCallback } from 'react';

import { ProductMappingVerificationStatus } from '@/generated/gql/graphql';
import { BrandItem, BrandProduct } from '@/hooks/graphql/brandProduct';

import { useUndoStack } from '../../hooks/useUndoStack';
import { ImageModalState, PendingVerificationItem } from '../../types';

import { VerificationQueries } from './useVerificationQueries';

type UndoStack = ReturnType<typeof useUndoStack>;
type SelectableItem = PendingVerificationItem & { isSelected: boolean };

type Params = {
  selectedItems: SelectableItem[];
  deselectedItems: SelectableItem[];
  currentItems: SelectableItem[];
  itemSelections: Record<string, boolean>;
  setItemSelections: Dispatch<SetStateAction<Record<string, boolean>>>;
  verificationItems: PendingVerificationItem[];
  setVerificationItems: Dispatch<SetStateAction<PendingVerificationItem[]>>;
  hasVerificationMore: boolean;
  isLoadingVerificationMore: boolean;
  loadMoreVerifications: () => Promise<void>;
  loadVerificationsForBrandProduct: (brandProductId: number) => Promise<void>;
  selectedBrandItem: BrandItem | null;
  selectedBrandProduct: BrandProduct | null;
  setSelectedBrandProduct: Dispatch<SetStateAction<BrandProduct | null>>;
  selectedBrandItemIndex: number;
  setSelectedBrandItemIndex: Dispatch<SetStateAction<number>>;
  filteredBrandItems: BrandItem[];
  setAllBrandItems: Dispatch<SetStateAction<BrandItem[]>>;
  expandedItems: BrandProduct[];
  setExpandedItems: Dispatch<SetStateAction<BrandProduct[]>>;
  expandedSelectedIndex: number;
  setExpandedSelectedIndex: Dispatch<SetStateAction<number>>;
  expandBrandItem: (item: BrandItem) => void;
  focusedPostIndex: number;
  setFocusedPostIndex: Dispatch<SetStateAction<number>>;
  setIsLeftPanelFocused: Dispatch<SetStateAction<boolean>>;
  setIncludeVerified: Dispatch<SetStateAction<boolean>>;
  setImageModalData: Dispatch<SetStateAction<ImageModalState>>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  batchVerifyMutation: VerificationQueries['batchVerifyMutation'];
  removeMappingMutation: VerificationQueries['removeMappingMutation'];
  pushUndo: UndoStack['pushUndo'];
  undo: UndoStack['undo'];
  isUndoing: boolean;
};

// 확정·실행 취소·매핑 해제 등 사용자 액션 핸들러 모음 (상태는 부모·목록 훅이 소유).
export function useVerificationActions({
  selectedItems,
  deselectedItems,
  currentItems,
  itemSelections,
  setItemSelections,
  verificationItems,
  setVerificationItems,
  hasVerificationMore,
  isLoadingVerificationMore,
  loadMoreVerifications,
  loadVerificationsForBrandProduct,
  selectedBrandItem,
  selectedBrandProduct,
  setSelectedBrandProduct,
  selectedBrandItemIndex,
  setSelectedBrandItemIndex,
  filteredBrandItems,
  setAllBrandItems,
  expandedItems,
  setExpandedItems,
  expandedSelectedIndex,
  setExpandedSelectedIndex,
  expandBrandItem,
  focusedPostIndex,
  setFocusedPostIndex,
  setIsLeftPanelFocused,
  setIncludeVerified,
  setImageModalData,
  showToast,
  batchVerifyMutation,
  removeMappingMutation,
  pushUndo,
  undo,
  isUndoing,
}: Params) {
  const handleConfirmMatching = useCallback(async () => {
    const itemsToApprove = selectedItems.filter((item) => item.verificationStatus !== 'VERIFIED');
    const itemsToReject = deselectedItems.filter((item) => item.verificationStatus !== 'REJECTED');
    const totalCount = itemsToApprove.length + itemsToReject.length;

    if (totalCount === 0) {
      showToast('변경 사항이 없습니다.', 'info');
      return;
    }

    // #7: Undo를 위해 현재 상태 저장
    const previousSelections = { ...itemSelections };
    const previousStatuses: Record<string, string | null> = {};
    verificationItems.forEach((item) => {
      previousStatuses[item.id] = item.verificationStatus;
    });

    try {
      if (itemsToApprove.length > 0) {
        await batchVerifyMutation({
          variables: {
            productMappingIds: itemsToApprove.map((item) => parseInt(item.id)),
            result: ProductMappingVerificationStatus.Verified,
          },
        });
      }
      if (itemsToReject.length > 0) {
        await batchVerifyMutation({
          variables: {
            productMappingIds: itemsToReject.map((item) => parseInt(item.id)),
            result: ProductMappingVerificationStatus.Rejected,
          },
        });
      }

      // #7: Undo 스택에 추가
      pushUndo({
        approvedIds: itemsToApprove.map((i) => i.id),
        rejectedIds: itemsToReject.map((i) => i.id),
        brandProductId: selectedBrandProduct?.id ?? '',
        previousSelections,
        previousStatuses,
        timestamp: Date.now(),
      });

      // 로컬 상태 업데이트 (optimistic)
      setVerificationItems((prev) =>
        prev.map((item) => {
          if (itemsToApprove.some((a) => a.id === item.id)) {
            return { ...item, verificationStatus: 'VERIFIED' };
          }
          if (itemsToReject.some((r) => r.id === item.id)) {
            return { ...item, verificationStatus: 'REJECTED' };
          }
          return item;
        }),
      );

      showToast(
        `저장 완료! ✓ ${itemsToApprove.length}건 승인${itemsToReject.length > 0 ? ` · ✗ ${itemsToReject.length}건 제외` : ''}`,
        'success',
      );

      // pendingVerificationCount 업데이트
      if (selectedBrandItem) {
        setAllBrandItems((prev) =>
          prev.map((item) =>
            item.id === selectedBrandItem.id
              ? {
                  ...item,
                  pendingVerificationCount: Math.max(0, item.pendingVerificationCount - totalCount),
                }
              : item,
          ),
        );
      }
      if (selectedBrandProduct) {
        setExpandedItems((prev) =>
          prev.map((bp) =>
            bp.id === selectedBrandProduct.id
              ? {
                  ...bp,
                  pendingVerificationCount: Math.max(0, bp.pendingVerificationCount - totalCount),
                }
              : bp,
          ),
        );
      }
      setIncludeVerified(true);
    } catch (error) {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      console.error(error);
    }
    // setter 들은 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedItems,
    deselectedItems,
    selectedBrandProduct,
    selectedBrandItem,
    showToast,
    batchVerifyMutation,
    itemSelections,
    verificationItems,
    pushUndo,
  ]);

  // #7: 실행 취소 핸들러
  const handleUndo = useCallback(async () => {
    const undoneAction = await undo();
    if (undoneAction) {
      // 로컬 상태를 이전 상태로 복원
      setVerificationItems((prev) =>
        prev.map((item) => ({
          ...item,
          verificationStatus: undoneAction.previousStatuses[item.id] ?? item.verificationStatus,
        })),
      );
      setItemSelections(undoneAction.previousSelections);
      showToast('실행 취소 완료', 'info');

      // pendingVerificationCount 복원
      const restoredCount = undoneAction.approvedIds.length + undoneAction.rejectedIds.length;
      if (selectedBrandItem) {
        setAllBrandItems((prev) =>
          prev.map((item) =>
            item.id === selectedBrandItem.id
              ? { ...item, pendingVerificationCount: item.pendingVerificationCount + restoredCount }
              : item,
          ),
        );
      }
    } else if (!isUndoing) {
      showToast('취소할 작업이 없습니다.', 'info');
    }
    // setter 들은 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, isUndoing, showToast, selectedBrandItem]);

  // ─────────────────────────────────────────────
  // 핸들러
  // ─────────────────────────────────────────────

  const handleItemClick = useCallback(
    (idx: number) => {
      setFocusedPostIndex(idx);
      setIsLeftPanelFocused(false);
      if (idx >= currentItems.length - 3 && hasVerificationMore && !isLoadingVerificationMore) {
        loadMoreVerifications();
      }
    },
    // setter 들은 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentItems.length, hasVerificationMore, isLoadingVerificationMore, loadMoreVerifications],
  );

  // 매핑 해제 — 서버는 product 단위로 매핑 행을 전부 지운다(matching-api adminRemoveMapping)
  const handleRemoveMapping = useCallback(
    async (item: PendingVerificationItem) => {
      if (!window.confirm(`이 딜의 매핑을 해제할까요?\n${item.product?.title ?? item.productId}`))
        return;
      try {
        await removeMappingMutation({ variables: { productId: item.productId } });
        setVerificationItems((prev) => prev.filter((v) => v.id !== item.id));
        showToast('매핑을 해제했습니다.');
      } catch (error) {
        showToast(`해제 실패: ${(error as Error).message}`, 'error');
      }
    },
    // setter 들은 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [removeMappingMutation, showToast],
  );

  const handleSimilarMapped = useCallback(
    (count: number) => {
      showToast(`${count}건 매핑 완료 (승인완료)`);
      if (selectedBrandProduct) loadVerificationsForBrandProduct(parseInt(selectedBrandProduct.id));
    },
    [showToast, selectedBrandProduct, loadVerificationsForBrandProduct],
  );

  // #1: danawaUrl도 같이 전달
  const handleImageClick = useCallback(
    (thumbnail: string, title: string, danawaUrl?: string | null) => {
      if (!selectedBrandProduct) return;

      setImageModalData({
        isOpen: true,
        danawaImage: '',
        danawaTitle: `${selectedBrandProduct.brandName} ${selectedBrandProduct.productName}`,
        // 누른 항목의 링크 — 예전엔 포커스된 항목 것이라 탭(포커스 이동 없음)하면 엉뚱한 상품이 열렸다
        danawaUrl: danawaUrl ?? undefined,
        communityImage: thumbnail || undefined,
        communityTitle: title,
      });
    },
    // setter 들은 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedBrandProduct],
  );

  const handleConfirmAndNext = useCallback(async () => {
    await handleConfirmMatching();
    // details 탭에서 다음 BrandProduct로 이동
    const nextExpandedIndex = expandedSelectedIndex + 1;
    if (nextExpandedIndex < expandedItems.length) {
      setSelectedBrandProduct(expandedItems[nextExpandedIndex]);
      setExpandedSelectedIndex(nextExpandedIndex);
    } else {
      // 모든 BrandProduct 처리 완료 → 다음 BrandItem으로 이동
      const nextBrandItemIndex = selectedBrandItemIndex + 1;
      if (nextBrandItemIndex < filteredBrandItems.length) {
        setSelectedBrandItemIndex(nextBrandItemIndex);
        expandBrandItem(filteredBrandItems[nextBrandItemIndex]);
      }
    }
    setFocusedPostIndex(-1);
    setIsLeftPanelFocused(true);
    // setter 들은 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    handleConfirmMatching,
    expandedSelectedIndex,
    expandedItems,
    selectedBrandItemIndex,
    filteredBrandItems,
    expandBrandItem,
  ]);

  return {
    handleConfirmMatching,
    handleUndo,
    handleItemClick,
    handleRemoveMapping,
    handleSimilarMapped,
    handleImageClick,
    handleConfirmAndNext,
  };
}
