'use client';

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import customerService from './customer-service';

const isBootedAtom = atom(false);

const CustomerServiceBoot = () => {
  const [isBooted, setIsBooted] = useAtom(isBootedAtom);

  useEffect(() => {
    if (typeof window === 'undefined' || isBooted) return;
    setIsBooted(true);
    customerService.onBootStrap();
  }, [isBooted, setIsBooted]);
  return null;
};

export default CustomerServiceBoot;
