import { Dispatch, SetStateAction, useEffect } from 'react';

import { BrandItem, BrandProduct } from '@/hooks/graphql/brandProduct';

import { ImageModalState, PendingVerificationItem } from '../../types';

type Params = {
  imageModalData: ImageModalState;
  setImageModalData: Dispatch<SetStateAction<ImageModalState>>;
  isShortcutModalOpen: boolean;
  setIsShortcutModalOpen: Dispatch<SetStateAction<boolean>>;
  isLeftPanelFocused: boolean;
  setIsLeftPanelFocused: Dispatch<SetStateAction<boolean>>;
  activeTab: 'brands' | 'details';
  setActiveTab: Dispatch<SetStateAction<'brands' | 'details'>>;
  filteredBrandItems: BrandItem[];
  selectedBrandItemIndex: number;
  setSelectedBrandItemIndex: Dispatch<SetStateAction<number>>;
  expandedItems: BrandProduct[];
  expandedSelectedIndex: number;
  setExpandedSelectedIndex: Dispatch<SetStateAction<number>>;
  selectedBrandProduct: BrandProduct | null;
  setSelectedBrandProduct: Dispatch<SetStateAction<BrandProduct | null>>;
  verificationItems: PendingVerificationItem[];
  focusedPostIndex: number;
  setFocusedPostIndex: Dispatch<SetStateAction<number>>;
  highlightBrandItem: (item: BrandItem) => void;
  expandBrandItem: (item: BrandItem) => void;
  toggleItemSelection: (itemId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  handleConfirmMatching: () => Promise<void>;
  handleConfirmAndNext: () => Promise<void>;
  handleUndo: () => Promise<void>;
};

// 키보드 네비게이션 — 핸들러 하나·의존성 배열 하나를 원본 그대로 옮겼다.
export function useKeyboardShortcuts({
  imageModalData,
  setImageModalData,
  isShortcutModalOpen,
  setIsShortcutModalOpen,
  isLeftPanelFocused,
  setIsLeftPanelFocused,
  activeTab,
  setActiveTab,
  filteredBrandItems,
  selectedBrandItemIndex,
  setSelectedBrandItemIndex,
  expandedItems,
  expandedSelectedIndex,
  setExpandedSelectedIndex,
  selectedBrandProduct,
  setSelectedBrandProduct,
  verificationItems,
  focusedPostIndex,
  setFocusedPostIndex,
  highlightBrandItem,
  expandBrandItem,
  toggleItemSelection,
  selectAll,
  deselectAll,
  handleConfirmMatching,
  handleConfirmAndNext,
  handleUndo,
}: Params) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (imageModalData.isOpen || isShortcutModalOpen) return;

      const isInSearchInput = document.activeElement?.tagName === 'INPUT';
      const isInTextarea = document.activeElement?.tagName === 'TEXTAREA';

      // 검색창에서 ArrowDown → 목록으로 이동
      if (isInSearchInput && e.key === 'ArrowDown') {
        e.preventDefault();
        (document.activeElement as HTMLElement).blur();
        setIsLeftPanelFocused(true);
        if (filteredBrandItems.length > 0 && selectedBrandItemIndex < 0) {
          setSelectedBrandItemIndex(0);
          highlightBrandItem(filteredBrandItems[0]);
        }
        return;
      }

      if (isInSearchInput || isInTextarea) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (isLeftPanelFocused) {
            if (activeTab === 'brands') {
              setSelectedBrandItemIndex((prev) => {
                const next = Math.min(prev + 1, filteredBrandItems.length - 1);
                highlightBrandItem(filteredBrandItems[next]);
                return next;
              });
            } else if (activeTab === 'details' && expandedItems.length > 0) {
              setExpandedSelectedIndex((prev) => {
                const next = Math.min(prev + 1, expandedItems.length - 1);
                setSelectedBrandProduct(expandedItems[next]);
                return next;
              });
            }
          } else {
            setFocusedPostIndex((prev) => Math.min(prev + 1, verificationItems.length - 1));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isLeftPanelFocused) {
            if (activeTab === 'brands') {
              setSelectedBrandItemIndex((prev) => {
                const next = Math.max(prev - 1, 0);
                highlightBrandItem(filteredBrandItems[next]);
                return next;
              });
            } else if (activeTab === 'details' && expandedItems.length > 0) {
              setExpandedSelectedIndex((prev) => {
                const next = Math.max(prev - 1, 0);
                setSelectedBrandProduct(expandedItems[next]);
                return next;
              });
            }
          } else {
            setFocusedPostIndex((prev) => Math.max(prev - 1, 0));
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (isLeftPanelFocused && verificationItems.length > 0) {
            setIsLeftPanelFocused(false);
            setFocusedPostIndex(0);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (!isLeftPanelFocused) {
            setIsLeftPanelFocused(true);
            setFocusedPostIndex(-1);
          } else if (activeTab === 'details') {
            setActiveTab('brands');
            setIsLeftPanelFocused(true);
            setFocusedPostIndex(-1);
          }
          break;

        case ' ':
          e.preventDefault();
          if (isLeftPanelFocused) {
            if (activeTab === 'brands') {
              const currentItem = filteredBrandItems[selectedBrandItemIndex];
              if (currentItem) {
                expandBrandItem(currentItem);
              }
            } else if (activeTab === 'details') {
              setActiveTab('brands');
              setIsLeftPanelFocused(true);
              setFocusedPostIndex(-1);
            }
          } else {
            const currentItem = verificationItems[focusedPostIndex];
            if (currentItem) toggleItemSelection(currentItem.id);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            handleConfirmAndNext();
          } else {
            handleConfirmMatching();
          }
          break;

        case 'a':
        case 'A':
          if (e.shiftKey) {
            e.preventDefault();
            selectAll();
          }
          break;

        case 'n':
        case 'N':
          e.preventDefault();
          deselectAll();
          break;

        case 'i':
        case 'I':
          e.preventDefault();
          if (!isLeftPanelFocused && verificationItems[focusedPostIndex] && selectedBrandProduct) {
            const item = verificationItems[focusedPostIndex];
            setImageModalData({
              isOpen: true,
              danawaImage: '',
              danawaTitle: `${selectedBrandProduct.brandName} ${selectedBrandProduct.productName}`,
              danawaUrl: item.danawaUrl ?? undefined,
              communityImage: item.product?.thumbnail || undefined,
              communityTitle: item.product?.title || '',
            });
          }
          break;

        // #7: Ctrl+Z → 실행 취소
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;

        // #4: ? → 단축키 도움말
        case '?':
          e.preventDefault();
          setIsShortcutModalOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // setter 들은 부모 useState 원본이라 안정 — 원본 의존성 배열을 그대로 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLeftPanelFocused,
    activeTab,
    filteredBrandItems,
    expandedItems,
    verificationItems,
    handleConfirmMatching,
    handleConfirmAndNext,
    highlightBrandItem,
    expandBrandItem,
    toggleItemSelection,
    selectAll,
    deselectAll,
    selectedBrandProduct,
    imageModalData.isOpen,
    isShortcutModalOpen,
    handleUndo,
    selectedBrandItemIndex,
    expandedSelectedIndex,
    focusedPostIndex,
  ]);
}
