//import { pipeline, env } from '@xenova/transformers';
import { pipeline, env } from '@huggingface/transformers';

// Skip local check to avoid 404s (which return HTML and break JSON parsing)
env.allowLocalModels = false;
env.useBrowserCache = true; // Enable caching to prevent re-downloads

class AutomaticSpeechRecognitionPipeline {
    static task = 'automatic-speech-recognition' as const;
    static model = 'Xenova/whisper-tiny.en';
    static instance: any = null;

    static async getInstance(progressCallback: any = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback: progressCallback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const message = event.data;
    // console.log('Worker received message:', message.type);

    // Handle loading
    if (message.type === 'load') {
        try {
            await AutomaticSpeechRecognitionPipeline.getInstance((data: any) => {
                self.postMessage({
                    type: 'download',
                    data
                });
            });
            self.postMessage({ type: 'ready' });
        } catch (err: any) {
            self.postMessage({ type: 'error', data: err.message });
        }
        return;
    }

    // Handle classification/transcription
    if (message.type === 'generate') {
        // console.log('Worker: generating...');

        // Direct processing - NO accumulation
        const audioData = message.audio;

        const transcriber = await AutomaticSpeechRecognitionPipeline.getInstance();
        try {
            const output = await transcriber(audioData, {
                top_k: 0,
                do_sample: false,
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: true,
                callback_function: (item: any) => {
                    self.postMessage({
                        type: 'partial-update',
                        data: item
                    });
                }
            });

            // console.log('Worker: complete output', output);

            self.postMessage({
                type: 'complete',
                data: output
            });

        } catch (err: any) {
            self.postMessage({ type: 'error', data: err.message });
        }
    }
});
