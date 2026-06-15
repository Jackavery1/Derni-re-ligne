import { describe, it, expect } from 'vitest';
import { urlSupabaseValide, syncCloudConfigure, configurerSupabase } from '../js/config-sync.js';

describe('config-sync (audit P4)', () => {
    it('valide les URLs Supabase HTTPS', () => {
        expect(urlSupabaseValide('https://abc123.supabase.co')).toBe(true);
        expect(urlSupabaseValide('http://abc123.supabase.co')).toBe(false);
        expect(urlSupabaseValide('https://example.com')).toBe(false);
        expect(urlSupabaseValide('')).toBe(false);
    });

    it('syncCloudConfigure exige URL valide et cle anon', () => {
        localStorage.clear();
        configurerSupabase('https://test.supabase.co', 'anon-key');
        expect(syncCloudConfigure()).toBe(true);
        configurerSupabase('https://invalid.example.com', 'anon-key');
        expect(syncCloudConfigure()).toBe(false);
    });
});
