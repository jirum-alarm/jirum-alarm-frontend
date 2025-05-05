'use client';

import DeleteAccount from './DeleteAccount';
import Logout from './Logout';

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
