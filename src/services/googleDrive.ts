export const uploadFileToDrive = async (accessToken: string, file: Blob, filename: string, folderName = 'ScribeAssist Recordings'): Promise<any> => {
    // 1. Find or Create Folder
    let folderId = await findFolder(accessToken, folderName);
    if (!folderId) {
        folderId = await createFolder(accessToken, folderName);
    }

    // 2. Upload File
    const metadata = {
        name: filename,
        parents: [folderId],
        mimeType: 'audio/mp4', // or 'audio/webm' depending on recorder
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload file to Drive');
    }

    return await response.json();
};

const findFolder = async (accessToken: string, folderName: string): Promise<string | null> => {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
};

const createFolder = async (accessToken: string, folderName: string): Promise<string> => {
    const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });
    const data = await response.json();
    return data.id;
};
