export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
) {
  return (event: E) => {
    originalEventHandler?.(event);
    ourEventHandler?.(event);
  };
}
