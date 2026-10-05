'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { ConfirmProvider } from '@/components/Confirm';
import Header from '@/components/Header';
import QueryErrorBanner from '@/components/QueryErrorBanner';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { canAccessPath } from '@/lib/adminSection';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: accessData, loading: accessLoading } = useMyAdminAccess();
  const access = accessData?.myAdminAccess;

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-expanded');
    if (stored !== null) {
      setSidebarExpanded(stored === 'true');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded, mounted]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div>
          {/* <!-- ===== Page Wrapper Start ===== --> */}
          {/* <!-- ===== Sidebar Start ===== --> */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Start ===== --> */}
          <div
            className={`relative flex flex-1 flex-col transition-all duration-300 ease-in-out ${
              sidebarExpanded ? 'lg:ml-72.5' : 'lg:ml-20'
            }`}
          >
            {/* <!-- ===== Header Start ===== --> */}
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Header End ===== --> */}

            {/* <!-- ===== Main Content Start ===== --> */}
            <main>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <QueryErrorBanner />
                {/* 권한 없는 섹션은 URL 로 직접 들어와도 본문을 그리지 않는다(API 도 서버에서 막힘). */}
                {canAccessPath(access, pathname) ? (
                  children
                ) : accessLoading && !access ? null : (
                  <NoAccess hasRole={!!access?.roleName || !!access?.isAdmin} />
                )}
              </div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
          {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

const NoAccess = ({ hasRole }: { hasRole: boolean }) => (
  <div className="rounded-sm border border-stroke bg-white p-10 text-center dark:border-strokedark dark:bg-boxdark">
    <p className="text-lg font-semibold text-black dark:text-white">접근 권한이 없습니다</p>
    <p className="mt-2 text-sm text-bodydark2">
      {hasRole
        ? '이 메뉴는 내 역할에 포함돼 있지 않습니다.'
        : '아직 역할이 지정되지 않은 계정입니다.'}{' '}
      admin 에게 권한 관리에서 역할을 요청하세요.
    </p>
  </div>
);
