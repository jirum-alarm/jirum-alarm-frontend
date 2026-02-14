'use client';

import { memo } from 'react';

import { PendingVerificationItem } from '../types';
import { highlightMatches } from '../utils/highlightMatches';

interface VerificationItemProps {
  item: PendingVerificationItem;
  isSelected: boolean;
  index: number;
  isFocused: boolean;
  /** 하이라이팅을 위한 브랜드명 */
  brandName?: string;
  /** 하이라이팅을 위한 상품명 */
  productName?: string;
  /** 하이라이팅을 위한 용량 */
  volume?: string | null;
  /** 하이라이팅을 위한 개수 */
  amount?: string | null;
  onItemClick: (index: number) => void;
  onToggleSelection: (id: string) => void;
  onImageClick: (thumbnail: string, title: string) => void;
}

/**
 * 개별 검증 항목 컴포넌트
 *
 * 기능:
 * - 승인/거절 상태 표시 및 토글
 * - AI 매칭 신뢰도 뱃지 (#6 자동 승인 참고용)
 * - 키워드 하이라이팅 (#3)
 * - 원본 게시물 미리보기 - 가격, 출처, 원문 링크 (#8)
 * - 이미지 클릭으로 비교 모달 열기 (#1)
 */
const VerificationItem = memo(function VerificationItem({
  item,
  isSelected,
  index,
  isFocused,
  brandName,
  productName,
  volume,
  amount,
  onItemClick,
  onToggleSelection,
  onImageClick,
}: VerificationItemProps) {
  const verifierName = item.verifiedBy?.name;

  // 검증 상태에 따른 보더 스타일
  const getBorderClass = () => {
    if (isFocused) return 'border-primary ring-2 ring-primary/20';
    if (item.verificationStatus === 'VERIFIED')
      return 'border-success/50 bg-success/5 dark:bg-success/10';
    if (item.verificationStatus === 'REJECTED')
      return 'border-danger/50 bg-danger/5 dark:bg-danger/10';
    if (isSelected) return 'border-success/30';
    return 'border-danger/30';
  };

  // 상태 뱃지
  const getStatusBadge = () => {
    if (item.verificationStatus === 'VERIFIED') {
      return (
        <span className="rounded bg-success/10 px-1 py-0.5 text-[10px] font-bold text-success">
          승인완료
        </span>
      );
    }
    if (item.verificationStatus === 'REJECTED') {
      return (
        <span className="rounded bg-danger/10 px-1 py-0.5 text-[10px] font-bold text-danger">
          거절완료
        </span>
      );
    }
    return (
      <span
        className={`rounded px-1 py-0.5 text-[10px] font-bold ${
          isSelected ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}
      >
        {isSelected ? '승인 대기' : '거절 대기'}
      </span>
    );
  };

  // #6: AI 매칭 신뢰도 뱃지
  const getConfidenceBadge = () => {
    if (item.matchingConfidence == null) return null;
    const confidence = item.matchingConfidence;
    const colorClass =
      confidence >= 90
        ? 'bg-success/10 text-success'
        : confidence >= 70
          ? 'bg-warning/10 text-warning'
          : 'bg-danger/10 text-danger';
    return (
      <span
        className={`cursor-help rounded px-1 py-0.5 text-[10px] font-bold ${colorClass}`}
        title={item.matchingReasoning || `AI 매칭 신뢰도: ${confidence}%`}
      >
        {confidence}%
      </span>
    );
  };

  // #3: 키워드 하이라이팅이 적용된 제목 (브랜드명, 상품명, 용량, 개수)
  const renderTitle = () => {
    const title = item.product?.title || '제목 없음';
    if (brandName && productName) {
      return highlightMatches(title, brandName, productName, [volume, amount]);
    }
    return title;
  };

  return (
    <div
      data-post-index={index}
      onClick={() => onItemClick(index)}
      className={`group relative cursor-pointer rounded-xl border-2 bg-white p-1.5 shadow-sm transition-all dark:bg-boxdark ${getBorderClass()}`}
    >
      <div className="flex items-start gap-4">
        {/* 승인/거절 체크박스 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(item.id);
          }}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
            isSelected
              ? 'border-success bg-success text-white'
              : 'border-danger bg-danger/10 text-danger'
          }`}
        >
          {isSelected ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>

        {/* 썸네일 이미지 */}
        {item.product?.thumbnail && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(item.product?.thumbnail || '', item.product?.title || '');
            }}
            className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-stroke bg-white hover:scale-105 dark:border-strokedark"
          >
            <img
              src={item.product.thumbnail}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No';
              }}
            />
          </button>
        )}

        {/* 본문 내용 */}
        <div className="min-w-0 flex-1">
          {/* 상태 뱃지, 신뢰도, ID, 날짜, 검증자 */}
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            {getStatusBadge()}
            {getConfidenceBadge()}
            <span className="text-gray-400 text-[10px]">ID: {item.productId}</span>
            <span className="text-gray-400 text-[10px]">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            {item.verificationStatus === 'VERIFIED' && verifierName && (
              <span className="rounded bg-blue-50 px-1 py-0.5 text-[10px] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                검증: {verifierName}
              </span>
            )}
          </div>

          {/* #3: 하이라이팅 된 제목 + 다나와 링크 */}
          <div className="flex items-center gap-1">
            <p className="line-clamp-1 flex-1 text-xs font-semibold text-black dark:text-white">
              {renderTitle()}
            </p>
            {item.danawaUrl && (
              <a
                href={item.danawaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap text-[10px] text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                다나와
              </a>
            )}
          </div>

          {/* #8: 원본 게시물 미리보기 - 가격, 출처, 원문 링크 */}
          {(item.product?.price || item.product?.provider?.name || item.product?.url) && (
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              {item.product?.price && (
                <span className="text-[10px] font-bold text-primary">{item.product.price}</span>
              )}
              {item.product?.provider?.name && (
                <span className="text-gray-400 text-[10px]">{item.product.provider.name}</span>
              )}
              {item.product?.url && (
                <a
                  href={item.product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  원문 보기
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default VerificationItem;
