import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summarizeText } from './gemini';

describe('Gemini Service', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('should use the correct model (gemini-pro)', async () => {
        const mockSuccessResponse = {
            ok: true,
            json: async () => ({
                candidates: [{ content: { parts: [{ text: 'Summary' }] } }]
            })
        };
        (global.fetch as any).mockResolvedValue(mockSuccessResponse);

        await summarizeText('fake-token', 'fake-text');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('models/gemini-pro:generateContent'),
            expect.objectContaining({
                method: 'POST'
            })
        );
    });
});
