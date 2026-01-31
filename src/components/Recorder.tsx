import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2, FileText, CheckCircle } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTranscriber } from '../hooks/useTranscriber';
import { useAuth } from '../hooks/useAuth';
import { uploadFileToDrive } from '../services/googleDrive';
import { summarizeText } from '../services/gemini';
import { createGoogleDoc } from '../services/googleDocs';
import { logSessionToSheet } from '../services/googleSheets';

export const Recorder = () => {
    const { accessToken } = useAuth();
    const { transcript, transcribeAudio, isModelLoading } = useTranscriber();

    // No callback needed for post-recording
    const { isRecording, recordingTime, startRecording, stopRecording, audioBlob } = useAudioRecorder();

    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState('');
    const [summaryLink, setSummaryLink] = useState<string | null>(null);

    const handleTranscribe = () => {
        if (audioBlob) {
            transcribeAudio(audioBlob);
        }
    };

    const handleSummarize = async () => {
        if (!accessToken || !audioBlob) return;

        setIsProcessing(true);
        setProcessStatus('Uploading audio to Drive...');

        try {
            const timestamp = new Date().toLocaleString();
            const sessionName = `Session ${timestamp}`;

            // 1. Upload Audio
            const driveFile = await uploadFileToDrive(accessToken, audioBlob, `Audio - ${sessionName}.mp4`);
            const audioLink = driveFile.webViewLink;

            setProcessStatus('Generating essence with Gemini...');

            // 2. Summarize
            const summary = await summarizeText(accessToken, transcript);

            setProcessStatus('Creating Google Doc...');

            // 3. Create Doc
            const doc = await createGoogleDoc(accessToken, `Summary - ${sessionName}`, summary);
            setSummaryLink(doc.webViewLink);

            setProcessStatus('Logging to Sheets...');

            // 4. Log to Sheets
            await logSessionToSheet(accessToken, {
                date: timestamp,
                sessionName: sessionName,
                summaryLink: doc.webViewLink,
                audioLink: audioLink
            });

            setProcessStatus('Done!');
        } catch (error) {
            console.error(error);
            setProcessStatus('Error occurred. Check console.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const { isBusy } = useTranscriber(); // Access isBusy from hook if exported, or useTranscriber needs to export it

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-center"
                style={{ flexDirection: 'column', gap: '2rem' }}
            >
                {/* Header Section */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {isRecording ? 'Recording in Progress' : 'Ready to Record'}
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {isRecording ? formatTime(recordingTime) : 'Click the microphone to start'}
                    </p>
                    {isModelLoading && (
                        <p style={{ color: 'var(--color-warning)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Loading AI Model (this may take a moment)...
                        </p>
                    )}
                </div>

                {/* Mic Button */}
                <div style={{ position: 'relative' }}>
                    {isRecording && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                position: 'absolute',
                                top: -10, left: -10, right: -10, bottom: -10,
                                background: 'var(--color-error)',
                                borderRadius: '50%',
                                zIndex: 0
                            }}
                        />
                    )}

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isModelLoading || isProcessing || isBusy}
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            backgroundColor: isModelLoading ? 'var(--color-bg-tertiary)' : (isRecording ? 'var(--color-error)' : 'var(--color-accent-primary)'),
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', zIndex: 1, transition: 'all 0.3s ease',
                            cursor: (isModelLoading || isProcessing || isBusy) ? 'not-allowed' : 'pointer',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {isRecording ? <Square fill="currentColor" size={32} /> : <Mic size={32} />}
                    </button>
                </div>

                {/* Transcript Area */}
                <div
                    style={{
                        width: '100%',
                        background: 'var(--color-bg-secondary)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '2rem',
                        minHeight: '200px',
                        border: '1px solid var(--color-bg-tertiary)'
                    }}
                >
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                        {(isRecording || isBusy) && <Loader2 className="spin" size={14} />}
                        {isBusy ? 'Transcribing...' : 'Transcript'}
                    </h3>
                    <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                        {transcript || (
                            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>
                                {isRecording ? 'Recording audio...' : 'Transcript will appear here after recording and transcription.'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Post-Recording Actions */}
                {audioBlob && !isRecording && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-center"
                        style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}
                    >
                        <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%' }} />

                        {/* Transcribe Button (only if no transcript) */}
                        {!transcript && (
                            <button
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'var(--color-accent-primary)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                                onClick={handleTranscribe}
                                disabled={isBusy}
                            >
                                {isBusy ? <Loader2 className="spin" size={20} /> : <FileText size={20} />}
                                {isBusy ? 'Transcribing...' : 'Transcribe Audio'}
                            </button>
                        )}

                        {/* Summarize Button (only if transcript exists) */}
                        {transcript && !summaryLink && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: 'var(--color-accent-primary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: 500,
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                    onClick={handleSummarize}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="spin" size={20} /> : <FileText size={20} />}
                                    {isProcessing ? 'Processing...' : 'Summarize & Save'}
                                </button>
                                {processStatus && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{processStatus}</p>}
                            </div>
                        )}

                        {/* Success State */}
                        {summaryLink && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '1rem' }}>
                                    <CheckCircle size={20} /> Saved successfully!
                                </p>
                                <a
                                    href={summaryLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: 'var(--color-bg-tertiary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-md)',
                                        textDecoration: 'none',
                                        display: 'inline-block'
                                    }}
                                >
                                    Open Summary Doc
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
