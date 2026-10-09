'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { BrandItem, BrandProduct } from '@/hooks/graphql/brandProduct';

import { useUndoStack } from '../../hooks/useUndoStack';
import { ImageModalState, ToastState } from '../../types';
import ImageCompareModal from '../ImageCompareModal';
import KeyboardShortcutModal from '../KeyboardShortcutModal';
import SimilarDealsPanel from '../SimilarDealsPanel';
import Toast from '../Toast';

import BrandItemList from './BrandItemList';
import BrandSearchHeader from './BrandSearchHeader';
import { EXPANDED_MAX_PAGES, EXPANDED_PAGE_LIMIT } from './constants';
import ExpandedProductList from './ExpandedProductList';
import LeftPanelTabs from './LeftPanelTabs';
import LoadingScreen from './LoadingScreen';
import { useBrandItemList } from './useBrandItemList';
import { useBrandItemSearchSync } from './useBrandItemSearchSync';
import { useDebouncedSearch } from './useDebouncedSearch';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useScrollAndAutoPaging } from './useScrollAndAutoPaging';
import { useVerificationActions } from './useVerificationActions';
import { useVerificationList } from './useVerificationList';
import { useVerificationQueries } from './useVerificationQueries';
import VerificationList from './VerificationList';
import VerificationPanelHeader, { MobileActionBar } from './VerificationPanelHeader';
import VerificationStatsBar from './VerificationStatsBar';

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
// 훅 호출 순서는 원본의 useEffect 실행 순서(목록 반영 → 첫 항목 하이라이트 → 검증 로딩 → 검색 → 탭 →
// 키보드 → 스크롤·자동 페이징)를 그대로 따른다. 같은 커밋에서 여러 effect 가 돌 때 순서가 결과를 바꿀 수 있어서다.

const VerificationGroupByView = () => {
  // ── 검색 상태 ──
  const { searchQuery, debouncedSearchQuery, handleSearchChange } = useDebouncedSearch();

  // ── 선택 상태 ──
  const [selectedBrandItem, setSelectedBrandItem] = useState<BrandItem | null>(null);
  const [selectedBrandItemIndex, setSelectedBrandItemIndex] = useState(0);
  const [selectedBrandProduct, setSelectedBrandProduct] = useState<BrandProduct | null>(null);
  // 폰에서 검수 화면(우측 칸)을 보고 있는지 — 데스크톱은 두 칸이 늘 같이 보여 쓰지 않는다
  const [mobileDetail, setMobileDetail] = useState(false);
  const [focusedPostIndex, setFocusedPostIndex] = useState<number>(-1);
  const [isLeftPanelFocused, setIsLeftPanelFocused] = useState(true);

  // ── Expand 상태 (details 탭: BrandItem 하위 BrandProduct 목록) ──
  const [expandedItems, setExpandedItems] = useState<BrandProduct[]>([]);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);
  const [expandedSelectedIndex, setExpandedSelectedIndex] = useState(0);

  // ── 탭 / 필터 상태 ──
  const [activeTab, setActiveTab] = useState<'brands' | 'details'>('brands');
  // 탭을 바꾸면 왼쪽 패널로 포커스를 되돌린다 — effect 대신 렌더 중 비교로.
  const [focusResetTab, setFocusResetTab] = useState(activeTab);
  if (activeTab !== focusResetTab) {
    setFocusResetTab(activeTab);
    setIsLeftPanelFocused(true);
  }
  const [includeVerified, setIncludeVerified] = useState(true);
  const [isSimilarOpen, setIsSimilarOpen] = useState(false);

  // ── 모달 / 토스트 상태 ──
  const [imageModalData, setImageModalData] = useState<ImageModalState>({
    isOpen: false,
    danawaImage: '',
    danawaTitle: '',
    communityTitle: '',
  });
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'success',
  });
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  // ── #7: Undo 훅 ──
  const { pushUndo, undo, canUndo, isUndoing } = useUndoStack();

  // ── Refs ──
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // ── API Hooks ──
  const {
    brandItemData,
    brandItemLoading,
    fetchMoreBrandItems,
    fetchMoreBrandProducts,
    fetchPendingVerifications,
    pendingLoading,
    batchVerifyMutation,
    removeMappingMutation,
    brandItemsTotalCountData,
    pendingVerificationsTotalCountData,
    fetchBrandItemSearchTotalCount,
    brandItemSearchTotalCountData,
    fetchPendingVerificationsTotalCountByBrandProduct,
    pendingVerificationsTotalCountByBrandProductData,
  } = useVerificationQueries();

  // ── 좌측: 브랜드 아이템 목록 ──
  const {
    allBrandItems,
    setAllBrandItems,
    setBrandItemSearchAfter,
    hasBrandItemMore,
    setHasBrandItemMore,
    isLoadingBrandItemMore,
    loadMoreBrandItems,
  } = useBrandItemList({ brandItemData, fetchMoreBrandItems, debouncedSearchQuery });

  // ── Computed ──
  const filteredBrandItems = allBrandItems;

  // BrandItem 하이라이트만 (방향키, 클릭)
  const highlightBrandItem = useCallback((item: BrandItem) => {
    setSelectedBrandItem(item);
  }, []);

  // 확장 중 다른 BrandItem 을 열면 이전 페이지 루프의 응답을 버리기 위한 토큰
  const expandTokenRef = useRef(0);

  // BrandItem 확장: details 탭 전환 및 하위 BrandProduct 로드 (스페이스)
  // 서버 limit 상한이 50(@Max) 이라 한 번만 받으면 51번째부터가 안 보였다 → searchAfter 로 끝까지 이어 받는다.
  const expandBrandItem = useCallback(
    (item: BrandItem) => {
      const token = ++expandTokenRef.current;
      setSelectedBrandItem(item);
      setSelectedBrandProduct(null);
      setExpandedItems([]);
      setExpandedSelectedIndex(0);
      setActiveTab('details');
      setIsLoadingExpanded(true);

      const loadAll = async () => {
        let searchAfter: string[] | undefined;
        for (let page = 0; page < EXPANDED_MAX_PAGES; page++) {
          const result = await fetchMoreBrandProducts({
            variables: {
              limit: EXPANDED_PAGE_LIMIT,
              brandItemId: parseInt(item.id),
              searchAfter,
            },
          });
          if (token !== expandTokenRef.current) return;
          const products = result.data?.brandProductsOrderByMatchCount ?? [];
          if (page === 0) {
            // 첫 페이지는 바로 보여주고 나머지는 뒤에 붙인다
            setExpandedItems(products);
            if (products.length > 0) {
              setSelectedBrandProduct(products[0]);
              setExpandedSelectedIndex(0);
            }
            setIsLoadingExpanded(false);
          } else {
            setExpandedItems((prev) => [...prev, ...products]);
          }
          const last = products[products.length - 1];
          if (products.length < EXPANDED_PAGE_LIMIT || !last?.searchAfter) return;
          searchAfter = last.searchAfter;
        }
      };

      loadAll()
        .catch((error) => {
          console.error('Failed to load expanded items:', error);
        })
        .finally(() => {
          if (token === expandTokenRef.current) setIsLoadingExpanded(false);
        });
    },
    [fetchMoreBrandProducts],
  );

  useEffect(() => {
    if (allBrandItems.length > 0 && !selectedBrandItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 목록이 처음 채워지면 첫 항목을 고르고 그 항목의 검증 목록을 불러온다(조회를 동반) — 큰 화면이라 구조를 바꾸지 않는다.
      highlightBrandItem(allBrandItems[0]);
    }
  }, [allBrandItems, selectedBrandItem, highlightBrandItem]);

  // ── 우측: 검증 대기 목록 ──
  const {
    verificationItems,
    setVerificationItems,
    verificationError,
    hasVerificationMore,
    isLoadingVerificationMore,
    itemSelections,
    setItemSelections,
    currentItems,
    selectedItems,
    deselectedItems,
    stats,
    loadVerificationsForBrandProduct,
    loadMoreVerifications,
    toggleItemSelection,
    selectAll,
    deselectAll,
  } = useVerificationList({
    fetchPendingVerifications,
    fetchPendingVerificationsTotalCountByBrandProduct,
    selectedBrandProduct,
    includeVerified,
  });

  // ── 검색 ──
  const { isSearching } = useBrandItemSearchSync({
    debouncedSearchQuery,
    fetchMoreBrandItems,
    fetchBrandItemSearchTotalCount,
    brandItemData,
    highlightBrandItem,
    setSelectedBrandItem,
    setSelectedBrandProduct,
    setSelectedBrandItemIndex,
    setBrandItemSearchAfter,
    setHasBrandItemMore,
    setExpandedItems,
    setAllBrandItems,
  });

  // ─────────────────────────────────────────────
  // 탭 / 확장
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'brands' && selectedBrandItem) {
      const index = allBrandItems.findIndex((item) => item.id === selectedBrandItem.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 인덱스는 키보드 이동이 직접 바꾸기도 하는 상태라 선택 항목과 별도로 맞춘다 — 큰 화면이라 구조를 바꾸지 않는다.
      if (index >= 0) setSelectedBrandItemIndex(index);
    }
  }, [selectedBrandItem, allBrandItems, activeTab]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ isVisible: true, message, type });
    },
    [],
  );

  // ── 확정 / 실행 취소 / 항목 핸들러 ──
  const {
    handleConfirmMatching,
    handleUndo,
    handleItemClick,
    handleRemoveMapping,
    handleSimilarMapped,
    handleImageClick,
    handleConfirmAndNext,
  } = useVerificationActions({
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
  });

  // ── 키보드 네비게이션 ──
  useKeyboardShortcuts({
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
  });

  // ── 스크롤 & 자동 페이징 ──
  const { leftScrollRef, rightScrollRef } = useScrollAndAutoPaging({
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
  });

  // ─────────────────────────────────────────────
  // 로딩 화면
  // ─────────────────────────────────────────────

  if (brandItemLoading && allBrandItems.length === 0) {
    return <LoadingScreen />;
  }

  // ─────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────

  return (
    <>
      {/* 폰: 한 번에 한 칸만(목록 → 상품 탭 → 검수 → ‹ 목록). 높이는 화면에서 헤더·제목·하단 탭바를 뺀 만큼이라
          안쪽 스크롤·자동 페이징이 데스크톱과 같이 돈다 */}
      <div className="flex h-[calc(100dvh-12.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-[420px] overflow-hidden rounded-xl border border-stroke bg-white shadow-default lg:h-[calc(100vh-200px)] dark:border-strokedark dark:bg-boxdark">
        {/* ───── 좌측 패널: 브랜드 상품 목록 ───── */}
        <div
          ref={leftPanelRef}
          className={`${mobileDetail ? 'hidden lg:flex' : 'flex'} w-full shrink-0 flex-col transition-all lg:w-80 lg:border-r ${
            isLeftPanelFocused
              ? 'border-primary/50 dark:border-primary/50'
              : 'border-stroke dark:border-strokedark'
          }`}
        >
          {/* 검색 */}
          <BrandSearchHeader
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            isSearching={isSearching}
            debouncedSearchQuery={debouncedSearchQuery}
            allBrandItems={allBrandItems}
            hasBrandItemMore={hasBrandItemMore}
            brandItemSearchTotalCountData={brandItemSearchTotalCountData}
            brandItemsTotalCountData={brandItemsTotalCountData}
            pendingVerificationsTotalCountData={pendingVerificationsTotalCountData}
          />

          {/* 탭 */}
          <LeftPanelTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            expandedItems={expandedItems}
          />

          {/* 탭 콘텐츠 */}
          {activeTab === 'brands' ? (
            <BrandItemList
              leftScrollRef={leftScrollRef}
              filteredBrandItems={filteredBrandItems}
              selectedBrandItem={selectedBrandItem}
              selectedBrandItemIndex={selectedBrandItemIndex}
              isLeftPanelFocused={isLeftPanelFocused}
              hasBrandItemMore={hasBrandItemMore}
              isLoadingBrandItemMore={isLoadingBrandItemMore}
              setSelectedBrandItemIndex={setSelectedBrandItemIndex}
              highlightBrandItem={highlightBrandItem}
              setIsLeftPanelFocused={setIsLeftPanelFocused}
              loadMoreBrandItems={loadMoreBrandItems}
              expandBrandItem={expandBrandItem}
            />
          ) : (
            <ExpandedProductList
              selectedBrandItem={selectedBrandItem}
              selectedBrandProduct={selectedBrandProduct}
              expandedItems={expandedItems}
              expandedSelectedIndex={expandedSelectedIndex}
              isLeftPanelFocused={isLeftPanelFocused}
              setActiveTab={setActiveTab}
              setIsLeftPanelFocused={setIsLeftPanelFocused}
              setExpandedSelectedIndex={setExpandedSelectedIndex}
              setSelectedBrandProduct={setSelectedBrandProduct}
              onOpenDetail={() => setMobileDetail(true)}
            />
          )}
        </div>

        {/* ───── 우측 패널: 검증 항목 ───── */}
        <div
          className={`${mobileDetail ? 'flex' : 'hidden lg:flex'} min-w-0 flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-black`}
        >
          {selectedBrandProduct ? (
            <>
              {/* 헤더 */}
              <VerificationPanelHeader
                selectedBrandProduct={selectedBrandProduct}
                canUndo={canUndo}
                isUndoing={isUndoing}
                handleUndo={handleUndo}
                selectAll={selectAll}
                deselectAll={deselectAll}
                handleConfirmMatching={handleConfirmMatching}
                handleConfirmAndNext={handleConfirmAndNext}
                onBack={() => setMobileDetail(false)}
              />

              {/* 통계 + 필터 */}
              <VerificationStatsBar
                pendingVerificationsTotalCountByBrandProductData={
                  pendingVerificationsTotalCountByBrandProductData
                }
                stats={stats}
                isSimilarOpen={isSimilarOpen}
                setIsSimilarOpen={setIsSimilarOpen}
                includeVerified={includeVerified}
                setIncludeVerified={setIncludeVerified}
              />

              {isSimilarOpen && (
                <SimilarDealsPanel
                  key={selectedBrandProduct.id}
                  brandProduct={selectedBrandProduct}
                  seedTitles={verificationItems
                    .filter((v) => v.verificationStatus === 'VERIFIED' && v.product?.title)
                    .map((v) => v.product!.title)}
                  listedProductIds={new Set(verificationItems.map((v) => v.productId))}
                  onMapped={handleSimilarMapped}
                />
              )}

              {/* 검증 항목 목록 */}
              <VerificationList
                rightScrollRef={rightScrollRef}
                rightPanelRef={rightPanelRef}
                pendingLoading={pendingLoading}
                verificationItems={verificationItems}
                verificationError={verificationError}
                itemSelections={itemSelections}
                focusedPostIndex={focusedPostIndex}
                isLeftPanelFocused={isLeftPanelFocused}
                isLoadingVerificationMore={isLoadingVerificationMore}
                includeVerified={includeVerified}
                selectedBrandProduct={selectedBrandProduct}
                handleItemClick={handleItemClick}
                toggleItemSelection={toggleItemSelection}
                handleImageClick={handleImageClick}
                handleRemoveMapping={handleRemoveMapping}
              />
              <MobileActionBar
                canUndo={canUndo}
                handleUndo={handleUndo}
                selectAll={selectAll}
                deselectAll={deselectAll}
                handleConfirmMatching={handleConfirmMatching}
                handleConfirmAndNext={handleConfirmAndNext}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              {filteredBrandItems.length > 0
                ? '좌측에서 브랜드 아이템을 선택해주세요.'
                : '브랜드 아이템이 없습니다.'}
            </div>
          )}
        </div>
      </div>

      {/* ───── 모달 ───── */}
      <ImageCompareModal
        isOpen={imageModalData.isOpen}
        onClose={() => setImageModalData((prev) => ({ ...prev, isOpen: false }))}
        danawaImage={imageModalData.danawaImage}
        danawaTitle={imageModalData.danawaTitle}
        danawaUrl={imageModalData.danawaUrl}
        communityImage={imageModalData.communityImage}
        communityTitle={imageModalData.communityTitle}
      />

      {/* #4: 단축키 도움말 모달 */}
      <KeyboardShortcutModal
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default VerificationGroupByView;
