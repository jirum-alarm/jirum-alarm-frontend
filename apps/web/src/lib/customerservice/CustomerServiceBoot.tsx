'use client';

import { useEffect } from 'react';

import customerService from './customer-service';

const CustomerServiceBoot = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    customerService.onBootStrap();
  }, []);
  return null;
};

export default CustomerServiceBoot;
