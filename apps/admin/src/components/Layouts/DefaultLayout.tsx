'use client';
import React, { useState, ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface Props {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

export default function DefaultLayout({ isLoggedIn, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <div>
        {/* <!-- ===== Page Wrapper Start ===== --> */}
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col lg:ml-72.5">
          {/* <!-- ===== Header Start ===== --> */}
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isLoggedIn={isLoggedIn}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </div>
    </>
  );
}
