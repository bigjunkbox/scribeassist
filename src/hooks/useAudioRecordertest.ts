import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
    isRecording: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
}

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            streamRef.current = stream;

            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg',
            ];

            let selectedMimeType = '';
            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    selectedMimeType = type;
                    break;
                }
            }

            console.log('Selected MIME type:', selectedMimeType);
            const mediaRecorder = new MediaRecorder(
                stream,
                selectedMimeType ? { mimeType: selectedMimeType } : undefined
            );

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const finalMimeType =
                    selectedMimeType || mediaRecorder.mimeType || 'audio/webm';

                const blob = new Blob(chunksRef.current, {
                    type: finalMimeType,
                });

                setAudioBlob(blob);

                streamRef.current?.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            };

            mediaRecorder.start(); // continuous recording

            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = window.setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Microphone access error:', error);
            alert('Unable to access microphone.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (!isRecording) return;

        const recorder = mediaRecorderRef.current;

        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }

        setIsRecording(false);

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [isRecording]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state !== 'inactive') {
                mediaRecorderRef.current?.stop();
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return {
        isRecording,
        recordingTime,
        audioBlob,
        startRecording,
        stopRecording,
    };
};
