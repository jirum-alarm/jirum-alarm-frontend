/* eslint-disable react/display-name */
import { ComponentType } from 'react';
import { QueryMe } from '@/graphql/auth';
import { User } from '@/types/user';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';

const withAuthValid = (Component: ComponentType<{ children: React.ReactNode }>) => {
  return (props: any) => {
    const { data, loading } = useQuery<{ me: User }>(QueryMe);
    if (loading) return <></>;
    if (!data) window.location.href = '/login';
    else return <Component {...props} />;
  };
};

export default withAuthValid;
