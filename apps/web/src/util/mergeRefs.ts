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

      (ref as React.RefObject<T | null>).current = node;
    }
  };
};
