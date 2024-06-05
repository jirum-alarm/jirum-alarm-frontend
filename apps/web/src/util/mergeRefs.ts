import React from 'react';

export const mergeRefs = <T>(...refs: React.Ref<T>[]): React.RefCallback<T> => {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === 'function') {
        ref(node);
        continue;
      }

      (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
};
