'use client';

import { useState } from 'react';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useIsLoggedIn from '@/hooks/useIsLoggedIn';

import VerificationHistory from './components/VerificationHistory';
import VerificationStatistics from './components/VerificationStatistics';
import VerificationTable from './components/VerificationTable';

const ProductMatchingPage = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const isLoggedIn = useIsLoggedIn();

  return (
    <DefaultLayout isLoggedIn={isLoggedIn}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">상품 매칭 검증</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          검증 대기 중인 상품 매칭을 승인하거나 거부할 수 있습니다.
        </p>
      </div>

      {/* 검증 통계 */}
      <div className="mb-6">
        <VerificationStatistics />
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-4 flex gap-2 border-b border-stroke dark:border-strokedark">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          검증 대기
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          onClick={() => setActiveTab('history')}
        >
          검증 이력
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'pending' ? <VerificationTable /> : <VerificationHistory />}
    </DefaultLayout>
  );
};

export default ProductMatchingPage;
