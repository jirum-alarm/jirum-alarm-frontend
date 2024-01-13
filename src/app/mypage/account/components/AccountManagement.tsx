'use client';
import { useLogout } from '@/hooks/useLogout';
import React from 'react';

const AccountManagement = () => {
  const logout = useLogout();
  return (
    <div className="flex items-center">
      <button className="px-6 py-3 text-[13px] text-gray-500" onClick={logout}>
        로그아웃
      </button>
      <div className="w-px h-3 bg-gray-200" />
      <button className="px-6 py-3 text-[13px] text-gray-500">회원탈퇴</button>
    </div>
  );
};

export default AccountManagement;
