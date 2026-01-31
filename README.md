# ScribeAssist

ScribeAssist is a production-ready React web application that records audio, provides real-time transcription, and uses Google Gemini to summarize conversations. It automatically saves the audio to Google Drive, the summary to Google Docs, and logs the session in Google Sheets.

## Features

- **Google OAuth 2.0 Login**: Secure authentication with granular permissions.
- **Audio Recording**: Start/Stop microphone control with visual feedback.
- **Real-Time Transcription**: Client-side Whisper model (running in a Web Worker) transcribes as you speak.
- **Smart Summarization**: Uses Google Gemini Pro to generate concise summaries.
- **Automated Workflow**:
  - Uploads audio to **Google Drive** provided folder.
  - Creates a **Google Doc** with the summary.
  - Appends a log entry to a **Google Sheet** named "scribeassist".
- **History View**: Browse past recordings and access their links directly.

## Setup Instructions

### 1. Google Cloud Project Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  **Enable APIs**:
    -   Google Drive API
    -   Google Docs API
    -   Google Sheets API
    -   Google Generative Language API (for Gemini)
4.  **Configure OAuth Consent Screen**:
    -   User Type: External (or Internal if using Workspace).
    -   Add the following **Scopes**:
        -   `https://www.googleapis.com/auth/drive.file`
        -   `https://www.googleapis.com/auth/documents`
        -   `https://www.googleapis.com/auth/spreadsheets`
        -   `https://www.googleapis.com/auth/generative-language.retriever`
5.  **Create Credentials**:
    -   Create an **OAuth 2.0 Client ID** for a "Web application".
    -   Add `http://localhost:5173` to **Authorized JavaScript origins**.
    -   Copy the **Client ID**.

### 2. Environment Configuration

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and paste your Client ID:
    ```env
    VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
    ```

### 3. Installation & Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:5173` in your browser.

## Usage

1.  **Sign In**: Click "Sign in with Google" and authorize the requested permissions.
2.  **Record**: Click the Microphone icon. Speak clearly. You will see the transcript appear in real-time.
3.  **Stop**: Click the Stop button.
4.  **Summarize**: Click "Summarize & Save". The app will:
    -   Upload the audio.
    -   Generate a summary.
    -   Save everything to Drive/Docs/Sheets.
5.  **History**: Switch to the History tab to view past sessions.

## Tech Stack

-   **React** (Vite + TypeScript)
-   **Framer Motion** (Animations)
-   **@xenova/transformers** (Client-side AI)
-   **Google Identity Services** (OAuth)
-   **Google APIs** (Drive, Docs, Sheets, Gemini)
