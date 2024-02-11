'use client';
import React from 'react';
import Logout from './Logout';
import DeleteAccount from './DeleteAccount';

const AccountManagement = () => {
  return (
    <div className="flex items-center">
      <Logout />
      <div className="h-3 w-px bg-gray-200" />
      <DeleteAccount />
    </div>
  );
};

export default AccountManagement;
