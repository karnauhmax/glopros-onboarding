import { composeHandlers } from '../compose-handlers';

describe('composeHandlers', () => {
  it('calls every handler with the event', () => {
    const first = jest.fn();
    const second = jest.fn();

    composeHandlers<string>(first, second)('change');

    expect(first).toHaveBeenCalledWith('change');
    expect(second).toHaveBeenCalledWith('change');
  });

  it('calls the handlers in the order they were given', () => {
    const order: string[] = [];

    composeHandlers<string>(
      () => order.push('first'),
      () => order.push('second'),
    )('change');

    expect(order).toEqual(['first', 'second']);
  });

  it('skips a handler that was not given', () => {
    const handler = jest.fn();

    composeHandlers<string>(undefined, handler)('change');

    expect(handler).toHaveBeenCalledWith('change');
  });
});
