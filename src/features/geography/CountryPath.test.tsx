import { describe, expect, it, vi } from 'vitest';
import { CountryPath } from './CountryPath.web';

const props = { d: 'M0,0 10,0 10,10Z', fill: '#fff', stroke: '#000', strokeWidth: 1 };

describe('web country paths', () => {
  it('uses a DOM click handler without native responder props', () => {
    const onSelect = vi.fn();
    const element = CountryPath({ ...props, onSelect });
    expect(element.type).toBe('path');
    expect(element.props).toEqual({ ...props, strokeLinejoin: 'round', onClick: onSelect });
    element.props.onClick();
    expect(onSelect).toHaveBeenCalledOnce();
  });

});
