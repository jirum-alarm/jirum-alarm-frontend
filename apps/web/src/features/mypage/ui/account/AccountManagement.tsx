'use client';

import DeleteAccount from './DeleteAccount';
import Logout from './Logout';

const AccountManagement = () => {
  return (
    <div className="flex items-center">
      <Logout />
      <div className="bg-surface-emphasis h-3 w-px" />
      <DeleteAccount />
    </div>
  );
};

export default AccountManagement;
