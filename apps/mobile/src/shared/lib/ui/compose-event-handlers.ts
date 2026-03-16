/**
 * Composes multiple event handlers into one
 *
 * This is useful when building reusable UI components where:
 * 1. The component has its own internal event handler logic
 * 2. The component user wants to provide their own event handler
 * 3. Both handlers need to be executed
 *
 * @template E - The event type (e.g., FocusEvent, ClickEvent)
 * @param originalEventHandler - The user-provided event handler (optional)
 * @param ourEventHandler - The component's internal event handler (optional)
 * @returns A composed handler that calls both handlers in sequence with the event argument
 */
export const composeEventHandlers = <E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
) => {
  return (event: E) => {
    originalEventHandler?.(event);
    ourEventHandler?.(event);
  };
};
