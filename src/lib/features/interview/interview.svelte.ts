import { env } from '$env/dynamic/public';

//Konfigurasi Awal
const CONFIG = {
  API_HOST: 'generativelanguage.googleapis.com',
  MODEL: 'gemini-3.1-flash-live-preview',
  VOICE: 'zephyr',
  IN_RATE: 16000,
  OUT_RATE: 24000,
  BUFFER: 2048,
  SILENCE_MS: 15000,
  RMS_THRESHOLD: 500
};

export const ROLES = ['Web Developer', 'Data Scientist', 'Cloud Engineer'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_MODULES: Record<Role, string[]> = {
  'Web Developer': ['React & Next.js', 'State Management (Svelte)', 'API Integration'],
  'Data Scientist': ['Python for Data Analysis', 'Machine Learning Models', 'SQL & Data Warehousing'],
  'Cloud Engineer': ['AWS Infrastructure', 'Docker & Kubernetes', 'CI/CD Pipelines']
};

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface LiveAPIResponse {
  setupComplete?: boolean;
  serverContent?: {
    turnComplete?: boolean;
    outputTranscription?: { text: string };
    inputTranscription?: { text: string };
    modelTurn?: {
      parts: Array<{ inlineData?: { mimeType: string; data: string; }; }>;
    };
  };
}

// Audio

function encodePCM(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodePCM(base64: string): Float32Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }

  const out = new Float32Array(bytes.length / 2);
  for (let i = 0; i < out.length; i++) {
    let s = bytes[i * 2] | (bytes[i * 2 + 1] << 8);
    if (s >= 32768) s -= 65536;
    out[i] = s / 32768;
  }
  return out;
}

function rms(int16: Int16Array): number {
  let sum = 0;
  for (let i = 0; i < int16.length; i++) {
    sum += int16[i] * int16[i];
  }
  return Math.sqrt(sum / int16.length);
}


// Suara AI
class AudioPlayer {
  private ctx: AudioContext | null = null;
  private queue: Float32Array[] = [];
  private nextTime = 0;

  // Respon Audio AI
  push(chunk: Float32Array) {
    this.queue.push(chunk);
    this.flush();
  }

  private flush() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext({ sampleRate: CONFIG.OUT_RATE });
      this.nextTime = this.ctx.currentTime;
    }

    while (this.queue.length) {
      const chunk = this.queue.shift()!;
      const buffer = this.ctx.createBuffer(1, chunk.length, CONFIG.OUT_RATE);
      buffer.copyToChannel(chunk as any, 0);

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      if (this.nextTime < now) this.nextTime = now;

      src.start(this.nextTime);
      this.nextTime += buffer.duration;
    }
  }

  destroy() {
    this.ctx?.close();
    this.ctx = null;
    this.queue = [];
  }
}

// Websocket
export class InterviewManager {
  connectionState = $state<'idle' | 'connecting' | 'setup' | 'ready' | 'error'>('idle');
  statusText = $state('Menunggu koneksi...');
  isRecording = $state(false);
  isSpeaking = $state(false);
  transcript = $state<TranscriptEntry[]>([]);
  selectedRole = $state<Role>('Web Developer');

  // Adaptasi Role AI
  completedModules = $derived(ROLE_MODULES[this.selectedRole].join(', '));

  private ws: WebSocket | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private player = new AudioPlayer();

  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private worklet: AudioWorkletNode | null = null;
  private recCtx: AudioContext | null = null;

  // Transcription AI dan User
  private appendTranscript(text: string, speaker: 'ai' | 'user') {
    const last = this.transcript.at(-1);

    if (last?.speaker === speaker) {
      this.transcript = [
        ...this.transcript.slice(0, -1),
        { ...last, text: last.text + text }
      ];
    } else {
      this.transcript = [
        ...this.transcript,
        {
          id: crypto.randomUUID(),
          speaker,
          text,
          timestamp: new Date()
        }
      ];
    }
  }

  // Kalau terlalu lama diam
  private nudgeIfSilent() {
    this.clearSilence();
    if (this.connectionState !== 'ready' || this.isSpeaking) return;

    this.silenceTimer = setTimeout(() => {
      this.sendSystem('[SISTEM: Kandidat terdiam selama 20 detik. Berikan dorongan atau tanyakan apakah mereka butuh klarifikasi.]');
    }, CONFIG.SILENCE_MS);
  }

  private clearSilence() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }


  // Websocket Live AI
  async connect() {
    const key = env.PUBLIC_Gemini_LiveAPI;

    if (!key) {
      this.connectionState = 'error';
      this.statusText = 'Kunci API tidak ditemukan.';
      return;
    }

    this.connectionState = 'connecting';
    this.statusText = 'Menghubungkan ke server wawancara...';

    try {
      const url = `wss://${CONFIG.API_HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => this.onOpen();
      this.ws.onmessage = (e) => this.onMessage(e);
      this.ws.onerror = () => {
        this.connectionState = 'error';
        this.statusText = 'Koneksi WebSocket terputus atau gagal.';
      };

      this.ws.onclose = (event) => {
        this.connectionState = 'idle';
        this.statusText = `Ditutup (code: ${event.code})`;
        this.stopMic();
      };
    } catch (err) {
      console.error('Koneksi WebSocket Gagal:', err);
      this.connectionState = 'error';
    }
  }

  private onOpen() {
    this.connectionState = 'setup';
    this.statusText = 'Menyiapkan instruksi wawancara...';

    const setupMessage = {
      setup: {
        model: `models/${CONFIG.MODEL}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: CONFIG.VOICE } }
          }
        },
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        // Biar AI gak motong user saat bicara
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: 'START_SENSITIVITY_LOW',
            endOfSpeechSensitivity: 'END_SENSITIVITY_LOW',
            prefixPaddingMs: 300,
            silenceDurationMs: 1500
          }
        },
        systemInstruction: {
          parts: [{
            text: `Anda adalah Pewawancara profesional untuk posisi ${this.selectedRole}.
            Kandidat sudah mempelajari: ${this.completedModules}.

            Struktur Wawancara (ikuti urutan ini secara ketat):
            1. PEMBUKA: Mulai dengan meminta kandidat memperkenalkan diri mereka.
            2. KEKUATAN & KELEMAHAN: Setelah perkenalan, tanyakan kelebihan dan kekurangan terbesar mereka.
            3. KECOCOKAN: Tanyakan mengapa mereka yakin cocok untuk posisi ${this.selectedRole} ini.
            4. TEKNIS: Baru setelah tiga tahap di atas selesai, ajukan pertanyaan-pertanyaan teknis mendalam.

            Aturan Mutlak:
            - Ajukan SATU pertanyaan saja, lalu tunggu jawaban kandidat selesai sepenuhnya sebelum melanjutkan.
            - Jangan pernah memotong atau menginterupsi kandidat yang sedang berbicara.
            - Jangan memberikan pertanyaan ganda sekaligus.
            - Berikan respons yang singkat dan fokus.`
          }]
        }
      }
    };

    this.ws?.send(JSON.stringify(setupMessage));
  }

  private async onMessage(event: MessageEvent) {
    try {
      const raw = event.data instanceof Blob ? await event.data.text() : event.data;
      const res = JSON.parse(raw) as LiveAPIResponse;

      if (res.setupComplete) {
        this.connectionState = 'ready';
        this.statusText = 'Pewawancara siap. Memulai percakapan...';

        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            const silence = new Int16Array(8000);
            this.ws.send(JSON.stringify({
              realtimeInput: {
                audio: { mimeType: `audio/pcm;rate=${CONFIG.IN_RATE}`, data: encodePCM(silence.buffer) }
              }
            }));
          }
        }, 300);
        return;
      }

      if (res.serverContent?.outputTranscription?.text) {
        this.appendTranscript(res.serverContent.outputTranscription.text, 'ai');
      }

      if (res.serverContent?.inputTranscription?.text) {
        this.appendTranscript(res.serverContent.inputTranscription.text, 'user');
      }

      if (res.serverContent?.modelTurn?.parts) {
        for (const part of res.serverContent.modelTurn.parts) {
          if (part.inlineData?.mimeType?.startsWith('audio/')) {
            this.isSpeaking = true;
            this.clearSilence();
            const audioData = decodePCM(part.inlineData.data);
            this.player.push(audioData);
            this.statusText = 'Pewawancara berbicara...';
          }
        }
      }

      if (res.serverContent?.turnComplete) {
        this.isSpeaking = false;
        this.statusText = 'Giliran Anda berbicara...';
        this.nudgeIfSilent();
      }

    } catch (err) {
      console.error('Gagal memproses pesan dari server AI:', err);
    }
  }

  private sendSystem(text: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true
      }
    }));
  }


  // Input Audio dari user
  async startMic() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: CONFIG.IN_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      this.recCtx = new AudioContext({ sampleRate: CONFIG.IN_RATE });
      this.source = this.recCtx.createMediaStreamSource(this.mediaStream);

      const blob = new Blob([AUDIO_WORKLET_SCRIPT], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await this.recCtx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      this.worklet = new AudioWorkletNode(this.recCtx, 'audio-recorder-worklet');

      this.worklet.port.onmessage = (e) => {
        const buf = e.data.data.int16arrayBuffer;
        if (!buf || this.ws?.readyState !== WebSocket.OPEN) return;

        const int16 = new Int16Array(buf);
        const level = rms(int16);

        this.ws.send(JSON.stringify({
          realtimeInput: {
            audio: { mimeType: `audio/pcm;rate=${CONFIG.IN_RATE}`, data: encodePCM(buf) }
          }
        }));

        if (level > CONFIG.RMS_THRESHOLD) {
          this.nudgeIfSilent();
        }
      };

      this.source.connect(this.worklet);
      this.isRecording = true;
      this.statusText = 'Merekam... Silakan berbicara';

    } catch (err) {
      console.error('Gagal memulai perekaman mikrofon:', err);
      this.statusText = 'Gagal mengakses mikrofon.';
    }
  }

  private stopMic() {
    this.source?.disconnect();
    this.worklet?.disconnect();
    this.mediaStream?.getTracks().forEach(t => t.stop());
    this.recCtx?.close();

    this.source = null;
    this.worklet = null;
    this.mediaStream = null;
    this.recCtx = null;

    this.isRecording = false;
    this.statusText = 'Mikrofon mati.';
  }

  toggleMic() {
    this.isRecording ? this.stopMic() : this.startMic();
  }

  disconnect() {
    this.stopMic();
    this.ws?.close();
    this.ws = null;
    this.player.destroy();
    this.connectionState = 'idle';
    this.statusText = 'Menunggu koneksi...';
    this.transcript = [];
  }
}

/* ==========================================
   5. WORKLET: Processor Audio (Inline)
   ========================================== */

const AUDIO_WORKLET_SCRIPT = `
class AudioRecordingWorklet extends AudioWorkletProcessor {
  buffer = new Int16Array(${CONFIG.BUFFER});
  index = 0;

  process(inputs) {
    const input = inputs[0];
    if (!input.length) return true;

    const data = input[0];
    for (let i = 0; i < data.length; i++) {
      this.buffer[this.index++] = data[i] * 32768;
      if (this.index >= this.buffer.length) this.flush();
    }
    return true;
  }

  flush() {
    this.port.postMessage({
      data: { int16arrayBuffer: this.buffer.slice(0, this.index).buffer }
    });
    this.index = 0;
  }
}
registerProcessor('audio-recorder-worklet', AudioRecordingWorklet);
`;
