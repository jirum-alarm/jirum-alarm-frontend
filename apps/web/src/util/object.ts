export const shallowEqual = <T>(objA: T, objB: T): boolean => {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA) as Array<keyof T>;
  const keysB = Object.keys(objB) as Array<keyof T>;
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]!], objB[keysA[i]])
    ) {
      return false;
    }
  }
  return true;
};

export const shallowArrayEqual = <T>(arrA: T[], arrB: T[]): boolean => {
  if (!arrA || !arrB || arrA.length !== arrB.length) return false;

  for (let i = 0; i < arrA.length; i++) {
    if (!shallowEqual(arrA[i], arrB[i])) {
      return false;
    }
  }

  return true;
};
