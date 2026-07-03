import { vi, expect } from 'vitest';

/** Attend qu’un mock Vitest ait été appelé exactement `fois` fois. */
export async function attendreMock(mock, fois = 1, timeout = 3000) {
    await vi.waitFor(() => expect(mock).toHaveBeenCalledTimes(fois), { timeout });
}

/** Vide la file des microtasks (import dynamique, then chaînés). */
export async function viderMicrotasks() {
    await Promise.resolve();
    await Promise.resolve();
}
