import React from 'react';

import type { DealCardProps } from '../index';
import type { ComponentRenderProps } from '@json-render/react';

export function DealCard({ props }: { props: DealCardProps }) {
  const { title, price, discountRate, mallName, imageUrl, url } = props;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.99] [.hero-deal-wrapper_&]:flex-row [.hero-deal-wrapper_&]:items-center [.hero-deal-wrapper_&]:border-2 [.hero-deal-wrapper_&]:border-blue-500 [.hero-deal-wrapper_&]:bg-blue-50/20 [.hero-deal-wrapper_&]:p-3 [.hero-deal-wrapper_&]:shadow-blue-500/20"
    >
      {imageUrl ? (
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 [.hero-deal-wrapper_&]:aspect-square [.hero-deal-wrapper_&]:h-20 [.hero-deal-wrapper_&]:w-20">
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 [.hero-deal-wrapper_&]:aspect-square [.hero-deal-wrapper_&]:h-20 [.hero-deal-wrapper_&]:w-20">
          <span className="text-[20px] text-gray-300">No Image</span>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 py-0.5">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="hidden items-center rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm [.hero-deal-wrapper_&]:inline-flex">
              🏆 원픽 핫딜
            </span>
            <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
              {mallName}
            </span>
          </div>
          <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-gray-900 transition-colors group-hover:text-blue-600 [.hero-deal-wrapper_&]:text-[14px] [.hero-deal-wrapper_&]:font-bold">
            {title}
          </h3>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {discountRate && (
              <span className="inline-flex items-center rounded-sm bg-red-50 px-1 py-0.5 text-[11px] font-extrabold text-red-600 [.hero-deal-wrapper_&]:bg-red-500 [.hero-deal-wrapper_&]:text-white">
                {discountRate}
              </span>
            )}
            <span className="text-[15px] font-bold tracking-tight text-gray-900 [.hero-deal-wrapper_&]:text-[16px] [.hero-deal-wrapper_&]:text-blue-700">
              {price}
            </span>
          </div>
          <div className="hidden items-center gap-1 text-[12px] font-bold text-blue-600 transition-colors group-hover:text-blue-700 [.hero-deal-wrapper_&]:flex">
            바로가기
            <svg
              className="size-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <svg
            className="size-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 [.hero-deal-wrapper_&]:hidden"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}
