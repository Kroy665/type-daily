import { describe, expect, it } from 'vitest';
import { isAllowedEdit } from './input';

describe('isAllowedEdit', () => {
    it('allows anything when backspace is on', () => {
        expect(isAllowedEdit('the qui', 'the qu', true)).toBe(true);
        expect(isAllowedEdit('the quick', 'the ', true)).toBe(true);
    });

    it('allows typing more when backspace is off', () => {
        expect(isAllowedEdit('the qu', 'the qui', false)).toBe(true);
        expect(isAllowedEdit('the qu', 'the qu', false)).toBe(true);
    });

    it('blocks deleting or replacing text when backspace is off', () => {
        expect(isAllowedEdit('the qui', 'the qu', false)).toBe(false); // Backspace
        expect(isAllowedEdit('the quick', 'the ', false)).toBe(false); // word delete
        expect(isAllowedEdit('the quick', 'the quack', false)).toBe(false); // replace selection
    });
});
