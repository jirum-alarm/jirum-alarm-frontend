'use client';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import ServerError from './ServerError';

interface Props {
  children: React.ReactNode;
}

const ApiErrorBoundary = ({ children }: Props) => {
  const { reset } = useQueryErrorResetBoundary();
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <ServerError onClick={() => resetErrorBoundary()} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ApiErrorBoundary;
