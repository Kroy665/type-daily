// With backspace turned off (exam mode), the only allowed edit is adding to the
// end of what's typed. This rejects Backspace, Delete, word-delete shortcuts,
// and replacing a selection, regardless of which key or gesture caused them.
export function isAllowedEdit(previous: string, next: string, allowBackspace: boolean): boolean {
    return allowBackspace || next.startsWith(previous);
}
