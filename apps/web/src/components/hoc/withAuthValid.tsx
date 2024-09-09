/* eslint-disable react/display-name */
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { ComponentType } from 'react';

import { PAGE } from '@/constants/page';
import { QueryMe } from '@/graphql/auth';
import { User } from '@/types/user';

const withAuthValid = (Component: ComponentType<{ children: React.ReactNode }>) => {
  return (props: any) => {
    const { data, loading } = useQuery<{ me: User }>(QueryMe);
    if (loading) return <></>;
    if (!data) {
      window.location.replace(PAGE.LOGIN);
      return;
    }

    return <Component {...props} />;
  };
};

export default withAuthValid;
