import { createRef } from 'react';

import { composeRefs } from '../compose-refs';

describe('composeRefs', () => {
  it('calls a function ref with the node', () => {
    const functionRef = jest.fn();
    const node = document.createElement('input');

    composeRefs<HTMLInputElement>(functionRef)(node);

    expect(functionRef).toHaveBeenCalledWith(node);
  });

  it('assigns the node to an object ref', () => {
    const objectRef = createRef<HTMLInputElement>();
    const node = document.createElement('input');

    composeRefs(objectRef)(node);

    expect(objectRef.current).toBe(node);
  });

  it('skips a ref that was not given', () => {
    const functionRef = jest.fn();
    const node = document.createElement('input');

    composeRefs<HTMLInputElement>(undefined, functionRef)(node);

    expect(functionRef).toHaveBeenCalledWith(node);
  });
});
