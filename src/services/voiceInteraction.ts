/**
 * Voice Interaction Service - Production Grade
 * 
 * This service orchestrates voice-driven interactions for the murder mystery game.
 * It combines speech recognition, AI processing, and emotional text-to-speech to create
 * a fully conversational experience with the mystical ORB.
 */

import { generateEmotionalSpeech, ElevenLabsStreamer } from './elevenlabs';
import { generateOrbResponse, type CaseContext, type GameState, type QuestionResponse } from './gemini';

export interface VoiceInteractionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface VoiceSession {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  currentEmotion?: string;
}

export class VoiceInteractionManager {
  private recognition: SpeechRecognition | null = null;
  private audioContext: AudioContext | null = null;
  private currentAudio: AudioBufferSourceNode | null = null;
  private streamer: ElevenLabsStreamer | null = null;
  private session: VoiceSession = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    confidence: 0,
  };

  constructor(private config: VoiceInteractionConfig = {
    language: 'en-US',
    continuous: false,
    interimResults: true,
  }) {
    this.initializeSpeechRecognition();
    this.initializeAudioContext();
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[VoiceInteraction] Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.session.isListening = true;
      this.onSessionUpdate?.(this.session);
      console.log('[VoiceInteraction] Started listening');
    };

    this.recognition.onend = () => {
      this.session.isListening = false;
      this.onSessionUpdate?.(this.session);
      console.log('[VoiceInteraction] Stopped listening');
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        this.session.transcript = result[0].transcript;
        this.session.confidence = result[0].confidence;
        console.log('[VoiceInteraction] Transcript received:', this.session.transcript, 'confidence:', this.session.confidence);
        this.onTranscriptReceived?.(this.session.transcript, this.session.confidence);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('[VoiceInteraction] Speech recognition error:', event.error);
      this.onError?.(event.error);
    };
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[VoiceInteraction] Audio context initialized');
    } catch (error) {
      console.error('[VoiceInteraction] Audio context initialization failed:', error);
    }
  }

  /**
   * Start listening for voice input
   */
  startListening(): void {
    if (!this.recognition) {
      console.error('[VoiceInteraction] Speech recognition not available');
      return;
    }

    if (this.session.isListening) {
      console.warn('[VoiceInteraction] Already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('[VoiceInteraction] Failed to start listening:', error);
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (this.recognition && this.session.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Process a voice question and generate an emotional audio response
   */
  async processVoiceQuestion(
    question: string,
    caseContext: CaseContext,
    gameState: GameState
  ): Promise<QuestionResponse> {
    this.session.isProcessing = true;
    this.onSessionUpdate?.(this.session);

    try {
      console.log('[VoiceInteraction] Processing question:', question);

      // Generate AI response with emotion
      const response = await generateOrbResponse(question, caseContext, gameState);
      
      console.log('[VoiceInteraction] Generated response with emotion:', response.emotion);
      
      // Convert to emotional speech
      const audioData = await generateEmotionalSpeech(
        response.text, 
        response.emotion, 
        response.confidence
      );
      
      // Play audio response
      if (audioData.byteLength > 0) {
        await this.playAudio(audioData);
        this.session.currentEmotion = response.emotion;
      }
      
      this.onResponseGenerated?.(response);
      return response;
      
    } catch (error) {
      console.error('[VoiceInteraction] Failed to process question:', error);
      this.onError?.(error.message);
      throw error;
    } finally {
      this.session.isProcessing = false;
      this.onSessionUpdate?.(this.session);
    }
  }

  /**
   * Stream narration with real-time emotional voice synthesis
   */
  async streamNarration(
    text: string, 
    emotion: 'mysterious' | 'serious' | 'dramatic' | 'whispering' = 'mysterious'
  ): Promise<void> {
    if (this.streamer) {
      this.streamer.close();
    }

    this.streamer = new ElevenLabsStreamer();
    
    const audioChunks: ArrayBuffer[] = [];
    
    await this.streamer.startStream(
      (chunk) => {
        audioChunks.push(chunk);
        // Play chunk immediately for real-time streaming
        this.playAudioChunk(chunk);
      },
      () => {
        console.log('[VoiceInteraction] Narration streaming completed');
        this.session.isSpeaking = false;
        this.onSessionUpdate?.(this.session);
      }
    );

    this.session.isSpeaking = true;
    this.session.currentEmotion = emotion;
    this.onSessionUpdate?.(this.session);

    // Send text with emotional markup
    this.streamer.sendText(text, { emotion, intensity: 0.7 });
    this.streamer.flush();
  }

  /**
   * Play audio from ArrayBuffer with enhanced error handling
   */
  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext || audioData.byteLength === 0) {
      console.warn('[VoiceInteraction] No audio context or empty audio data');
      return;
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0));
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      this.session.isSpeaking = true;
      this.onSessionUpdate?.(this.session);

      source.onended = () => {
        this.session.isSpeaking = false;
        this.onSessionUpdate?.(this.session);
        console.log('[VoiceInteraction] Audio playback completed');
      };

      source.start();
      this.currentAudio = source;
      
      console.log('[VoiceInteraction] Audio playback started, duration:', audioBuffer.duration, 'seconds');
      
    } catch (error) {
      console.error('[VoiceInteraction] Audio playback failed:', error);
      this.session.isSpeaking = false;
      this.onSessionUpdate?.(this.session);
    }
  }

  /**
   * Play individual audio chunk for streaming
   */
  private async playAudioChunk(chunk: ArrayBuffer): Promise<void> {
    if (!this.audioContext || chunk.byteLength === 0) return;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(chunk.slice(0));
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error('[VoiceInteraction] Chunk playback failed:', error);
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.stop();
      this.currentAudio = null;
    }
    
    if (this.streamer) {
      this.streamer.close();
      this.streamer = null;
    }
    
    this.session.isSpeaking = false;
    this.onSessionUpdate?.(this.session);
  }

  /**
   * Get current session state
   */
  getSession(): VoiceSession {
    return { ...this.session };
  }

  /**
   * Check if voice features are supported
   */
  isSupported(): boolean {
    return !!(this.recognition && this.audioContext);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopListening();
    this.stopAudio();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Event handlers (to be set by components)
  onSessionUpdate?: (session: VoiceSession) => void;
  onTranscriptReceived?: (transcript: string, confidence: number) => void;
  onResponseGenerated?: (response: QuestionResponse) => void;
  onError?: (error: string) => void;
}

// Global voice interaction manager instance
export const voiceManager = new VoiceInteractionManager();

// Type declarations for browser APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}