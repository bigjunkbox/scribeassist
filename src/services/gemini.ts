export const summarizeText = async (accessToken: string, text: string): Promise<string> => {
    // Model: use gemini-pro for broad availability with OAuth tokens
    const model = 'models/gemini-pro';

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
        throw new Error('Failed to summarize text');
    }

    const data = await response.json();
    // Safely extract text
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';
};
