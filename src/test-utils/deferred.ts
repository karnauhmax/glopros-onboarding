export interface Deferred<T = void> {
  promise: Promise<T>;
  resolve(value: T): void;
}

export function createDeferred<T = void>(): Deferred<T> {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });

  return { promise, resolve };
}
