

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


import { useAudioRecorder } from './hooks/useAudioRecordertest.ts';

function App() {
    const {
        isRecording,
        recordingTime,
        audioBlob,
        startRecording,
        stopRecording,
    } = useAudioRecorder();

    return (
        <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
            <h2>Audio Recorder Hook Test</h2>

            <button onClick={startRecording} disabled={isRecording}>
                Start
            </button>

            <button onClick={stopRecording} disabled={!isRecording}>
                Stop
            </button>

            <p>Recording time: {recordingTime}s</p>

            {audioBlob && (
                <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    style={{ marginTop: 10 }}
                />
            )}
        </div>
    );
}


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

