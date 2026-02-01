export const summarizeText = async (accessToken: string, text: string): Promise<string> => {
    // Model: use gemini-1.5-flash as default
    const model = 'models/gemini-1.5-flash';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Please provide a concise, readable summary of the following transcript:\n\n${text}`
                }]
            }]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Gemini API Error:', err);

        // Debug: List available models to help diagnose 404s
        if (response.status === 404) {
            console.log('Attempting to list available models...');
            try {
                const listResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const listData = await listResp.json();
                console.log('Available Models:', listData);
            } catch (listErr) {
                console.error('Failed to list models:', listErr);
            }
        }

        throw new Error('Failed to summarize text: ' + err);
    }

    const data = await response.json();
    // Safely extract text
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';
};
