import { useEffect, useRef } from 'react';

import { BrandItem } from '@/hooks/graphql/brandProduct';

import { PendingVerificationItem } from '../../types';

type Params = {
  activeTab: 'brands' | 'details';
  focusedPostIndex: number;
  selectedBrandItemIndex: number;
  expandedSelectedIndex: number;
  filteredBrandItems: BrandItem[];
  hasBrandItemMore: boolean;
  isLoadingBrandItemMore: boolean;
  loadMoreBrandItems: () => Promise<void>;
  verificationItems: PendingVerificationItem[];
  hasVerificationMore: boolean;
  isLoadingVerificationMore: boolean;
  loadMoreVerifications: () => Promise<void>;
};

// 키보드로 옮긴 포커스를 화면 안으로 스크롤하고, 끝 3개 안에 들어오면 다음 페이지를 부른다.
export function useScrollAndAutoPaging({
  activeTab,
  focusedPostIndex,
  selectedBrandItemIndex,
  expandedSelectedIndex,
  filteredBrandItems,
  hasBrandItemMore,
  isLoadingBrandItemMore,
  loadMoreBrandItems,
  verificationItems,
  hasVerificationMore,
  isLoadingVerificationMore,
  loadMoreVerifications,
}: Params) {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leftScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────
  // 스크롤 & 자동 페이징
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (focusedPostIndex >= 0 && rightScrollRef.current) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const el = rightScrollRef.current?.querySelector(`[data-post-index="${focusedPostIndex}"]`);
        el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }, 16);
    }
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [focusedPostIndex]);

  useEffect(() => {
    if (activeTab === 'brands' && selectedBrandItemIndex >= 0 && leftScrollRef.current) {
      if (leftScrollTimeoutRef.current) clearTimeout(leftScrollTimeoutRef.current);
      leftScrollTimeoutRef.current = setTimeout(() => {
        const el = leftScrollRef.current?.querySelector(
          `[data-product-index="${selectedBrandItemIndex}"]`,
        );
        el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }, 16);
    }
    return () => {
      if (leftScrollTimeoutRef.current) clearTimeout(leftScrollTimeoutRef.current);
    };
  }, [selectedBrandItemIndex, activeTab]);

  useEffect(() => {
    if (activeTab === 'details' && expandedSelectedIndex >= 0 && leftScrollRef.current) {
      const el = leftScrollRef.current.querySelector(
        `[data-expanded-index="${expandedSelectedIndex}"]`,
      );
      el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [expandedSelectedIndex, activeTab]);

  // 자동 페이징: 좌측
  useEffect(() => {
    if (
      activeTab === 'brands' &&
      selectedBrandItemIndex >= filteredBrandItems.length - 3 &&
      hasBrandItemMore &&
      !isLoadingBrandItemMore
    ) {
      loadMoreBrandItems();
    }
  }, [
    selectedBrandItemIndex,
    filteredBrandItems.length,
    hasBrandItemMore,
    isLoadingBrandItemMore,
    loadMoreBrandItems,
    activeTab,
  ]);

  // 자동 페이징: 우측
  useEffect(() => {
    if (
      focusedPostIndex >= verificationItems.length - 3 &&
      hasVerificationMore &&
      !isLoadingVerificationMore
    ) {
      loadMoreVerifications();
    }
  }, [
    focusedPostIndex,
    verificationItems.length,
    hasVerificationMore,
    isLoadingVerificationMore,
    loadMoreVerifications,
  ]);

  return { leftScrollRef, rightScrollRef };
}
