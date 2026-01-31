import { useState, useEffect, useRef, useCallback } from 'react';

export const useTranscriber = () => {
    const [transcript, setTranscript] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        console.log('useTranscriber: Initializing worker...');
        if (!workerRef.current) {
            // Create worker
            workerRef.current = new Worker(new URL('../worker.ts', import.meta.url), {
                type: 'module'
            });
            console.log('useTranscriber: Worker created');

            workerRef.current.onmessage = (event) => {
                const { type, data } = event.data;
                // console.log('useTranscriber: message received', type);

                switch (type) {
                    case 'ready':
                        console.log('useTranscriber: Worker READY');
                        setIsModelLoading(false);
                        break;
                    case 'download':
                        // Could track download progress here
                        setIsModelLoading(true);
                        console.log('Model downloading:', data);
                        break;
                    case 'partial-update':
                        // Handle partial updates if supported
                        // console.log('useTranscriber: partial update', data);
                        break;
                    case 'complete':
                        // Worker now returns full cumulative transcript
                        console.log('useTranscriber: Complete transcript received:', data);
                        setTranscript(data.text || '');
                        setIsBusy(false);
                        break;
                    case 'error':
                        console.error('Worker error:', data);
                        setIsBusy(false);
                        break;
                }
            };

            // Start loading model immediately
            workerRef.current.postMessage({ type: 'load' });
        }

        return () => {
            console.log('useTranscriber: Cleanup...');
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const transcribeAudio = useCallback(async (audioBlob: Blob) => {
        if (!workerRef.current) {
            console.warn('useTranscriber: Worker NOT READY');
            return;
        }

        setIsBusy(true);
        setTranscript(''); // Reset old transcript

        console.log('useTranscriber: Starting decode process for blob:', audioBlob.type, audioBlob.size);

        try {
            const arrayBuffer = await audioBlob.arrayBuffer();

            // Critical: Force 16000Hz sample rate for Whisper compatibility
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const channelData = audioBuffer.getChannelData(0); // Mono

            // Verify amplitude to ensure we aren't sending silent data
            let maxAmp = 0;
            for (let i = 0; i < channelData.length; i++) {
                const amp = Math.abs(channelData[i]);
                if (amp > maxAmp) maxAmp = amp;
            }
            console.log('useTranscriber: Decoded audio. Samples:', channelData.length, 'Max Amp:', maxAmp);

            if (maxAmp === 0) {
                console.warn('useTranscriber: Audio data is silent! Check microphone or recording.');
            }

            workerRef.current.postMessage({
                type: 'generate',
                audio: channelData
            });

            // Cleanup context to avoid memory leaks (though browsers handle this well usually)
            audioContext.close();

        } catch (error) {
            console.error('useTranscriber: Decoding error:', error);
            setIsBusy(false);
        }

    }, []);

    return {
        transcript,
        isBusy,
        isModelLoading,
        transcribeAudio
    };
};
