export const createGoogleDoc = async (accessToken: string, title: string, summary: string): Promise<any> => {
    // 1. Create Empty Doc
    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
        }),
    });

    if (!createResponse.ok) {
        throw new Error('Failed to create Google Doc');
    }

    const doc = await createResponse.json();
    const documentId = doc.documentId;

    // 2. Insert Content
    const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requests: [
                {
                    insertText: {
                        location: {
                            index: 1, // Start of doc
                        },
                        text: summary,
                    }
                }
            ]
        }),
    });

    if (!updateResponse.ok) {
        throw new Error('Failed to write to Google Doc');
    }

    // Return doc info including link (construct it)
    return {
        documentId,
        webViewLink: `https://docs.google.com/document/d/${documentId}/edit`
    };
};
