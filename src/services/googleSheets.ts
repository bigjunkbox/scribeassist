export interface SessionLog {
    date: string;
    sessionName: string;
    summaryLink: string;
    audioLink: string;
}

const SHEET_TITLE = 'scribeassist';

export const logSessionToSheet = async (accessToken: string, sessionData: SessionLog): Promise<void> => {
    // 1. Find or Create Spreadsheet
    let spreadsheetId = await findSpreadsheet(accessToken, SHEET_TITLE);

    if (!spreadsheetId) {
        spreadsheetId = await createSpreadsheet(accessToken, SHEET_TITLE);
        // Add header row
        await appendValues(accessToken, spreadsheetId, ['Date', 'Session Name', 'Summary Link', 'Audio Link']);
    }

    // 2. Append Data
    await appendValues(accessToken, spreadsheetId, [
        sessionData.date,
        sessionData.sessionName,
        sessionData.summaryLink,
        sessionData.audioLink
    ]);
};

const findSpreadsheet = async (accessToken: string, title: string): Promise<string | null> => {
    const query = `mimeType='application/vnd.google-apps.spreadsheet' and name='${title}' and trashed=false`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
};

const createSpreadsheet = async (accessToken: string, title: string): Promise<string> => {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            properties: {
                title: title,
            }
        }),
    });
    const data = await response.json();
    return data.spreadsheetId;
};

const appendValues = async (accessToken: string, spreadsheetId: string, values: string[]): Promise<void> => {
    // range can be 'Sheet1' to append to first sheet
    const range = 'Sheet1';
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            values: [values]
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Sheets Append Error:', error);
        throw new Error('Failed to append to sheet');
    }
};

export const fetchHistory = async (accessToken: string): Promise<SessionLog[]> => {
    const spreadsheetId = await findSpreadsheet(accessToken, SHEET_TITLE);
    if (!spreadsheetId) return [];

    const range = 'Sheet1!A2:D'; // Skip header
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.values) return [];

    return data.values.map((row: string[]) => ({
        date: row[0],
        sessionName: row[1],
        summaryLink: row[2],
        audioLink: row[3],
    }));
};
