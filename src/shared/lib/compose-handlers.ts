type EventHandler<TEvent> = (event: TEvent) => unknown;

export function composeHandlers<TEvent>(
  ...handlers: Array<EventHandler<TEvent> | undefined>
): EventHandler<TEvent> {
  return (event) => {
    for (const handler of handlers) {
      handler?.(event);
    }
  };
}
