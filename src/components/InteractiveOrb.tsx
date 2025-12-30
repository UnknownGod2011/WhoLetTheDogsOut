import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Mic, MicOff, Volume2, VolumeX, Skull } from 'lucide-react';
import { voicePipeline, type PipelineStatus, type VoiceQuestion } from '@/services/voicePipeline';
import { testGeminiConnection } from '@/services/gemini';
import { testElevenLabsConnection } from '@/services/elevenlabs';
import type { MurderCase } from '@/data/cases';

interface InteractiveOrbProps {
  murderCase: MurderCase | null;
  onQuestionAsked?: (question: string) => void;
  onResponseReceived?: (response: string) => void;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function InteractiveOrb({ 
  murderCase, 
  onQuestionAsked, 
  onResponseReceived, 
  onComplete,
  size = 'large' 
}: InteractiveOrbProps) {
  const [status, setStatus] = useState<PipelineStatus>(voicePipeline.getStatus());
  const [showDebug, setShowDebug] = useState(false);
  const [storyStarted, setStoryStarted] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  useEffect(() => {
    // Subscribe to pipeline status changes
    voicePipeline.onStateChange = setStatus;
    
    voicePipeline.onQuestionReceived = (question: VoiceQuestion) => {
      onQuestionAsked?.(question.text);
    };
    
    voicePipeline.onResponseReceived = (response: string, emotion: string) => {
      onResponseReceived?.(response);
    };

    return () => {
      voicePipeline.onStateChange = undefined;
      voicePipeline.onQuestionReceived = undefined;
      voicePipeline.onResponseReceived = undefined;
    };
  }, [onQuestionAsked, onResponseReceived]);

  // Separate effect to handle completion - only trigger when state changes to complete
  useEffect(() => {
    if (status.state === 'complete' && status.questionsRemaining === 0) {
      // Only trigger completion if we've actually started the story in this session
      if (storyStarted) {
        onComplete?.();
      }
    }
  }, [status.state, status.questionsRemaining, storyStarted, onComplete]);

  // Reset when case changes
  useEffect(() => {
    if (murderCase) {
      voicePipeline.reset();
      setStoryStarted(false);
    }
  }, [murderCase]);

  const handleOrbClick = async () => {
    if (!murderCase) return;

    if (!storyStarted) {
      // Start story narration
      setStoryStarted(true);
      await voicePipeline.startStoryNarration(murderCase);
    } else if (status.state === 'idle' && status.questionsRemaining > 0) {
      // Start voice capture for question
      voicePipeline.startVoiceCapture();
    }
  };

  const handleStopAudio = () => {
    voicePipeline.stopAudio();
  };

  const handleStopListening = () => {
    voicePipeline.stopVoiceCapture();
  };

  const handleSkipToAccusation = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    onComplete?.();
  };

  const handleCancelSkip = () => {
    setShowSkipDialog(false);
  };

  const handleTestGemini = async () => {
    console.log('[Debug] Testing Gemini connection...');
    const result = await testGeminiConnection();
    if (result.success) {
      console.log('[Debug] ✅ Gemini test successful!', result.response);
      alert('✅ Gemini API is working! Check console for details.');
    } else {
      console.error('[Debug] ❌ Gemini test failed:', result.error);
      alert(`❌ Gemini API failed: ${result.error}`);
    }
  };

  const handleTestElevenLabs = async () => {
    console.log('[Debug] Testing ElevenLabs API connection...');
    try {
      const result = await testElevenLabsConnection();
      
      if (result.success) {
        console.log('[Debug] ✅ ElevenLabs test successful!', result);
        alert(`✅ ElevenLabs is working! Found ${result.voices?.length || 0} voices available.`);
      } else {
        console.error('[Debug] ❌ ElevenLabs test failed:', result.error);
        alert(`❌ ElevenLabs failed: ${result.error}`);
      }
    } catch (error) {
      console.error('[Debug] ❌ ElevenLabs test failed:', error);
      alert(`❌ ElevenLabs failed: ${error.message}`);
    }
  };

  const getOrbSize = () => {
    switch (size) {
      case 'small': return 'w-16 h-16';
      case 'medium': return 'w-32 h-32';
      case 'large': return 'w-48 h-48';
      default: return 'w-48 h-48';
    }
  };

  const getOrbGlow = () => {
    switch (status.state) {
      case 'narrating': return 'shadow-[0_0_50px_#8B5CF6]';
      case 'listening': return 'shadow-[0_0_50px_#10B981]';
      case 'processing': return 'shadow-[0_0_50px_#F59E0B]';
      case 'speaking': return 'shadow-[0_0_50px_#EF4444]';
      case 'complete': return 'shadow-[0_0_30px_#6B7280]';
      default: return 'shadow-[0_0_30px_#8B5CF6]';
    }
  };

  const isClickable = !storyStarted || (status.state === 'idle' && status.questionsRemaining > 0);
  const isVoiceSupported = voicePipeline.isVoiceSupported();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Orb */}
      <div className="relative">
        <motion.div
          className={`${getOrbSize()} rounded-full bg-gradient-to-br from-purple-400 via-purple-600 to-purple-800 ${getOrbGlow()} cursor-pointer relative overflow-hidden`}
          onClick={handleOrbClick}
          animate={{
            scale: status.isSpeaking ? [1, 1.05, 1] : 1,
            rotate: status.state === 'processing' ? 360 : 0,
          }}
          transition={{
            scale: { duration: 2, repeat: status.isSpeaking ? Infinity : 0 },
            rotate: { duration: 2, repeat: status.state === 'processing' ? Infinity : 0, ease: "linear" }
          }}
          whileHover={isClickable ? { scale: 1.05 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* Pulsing center */}
          <motion.div
            className="absolute inset-1/4 rounded-full bg-white/30"
            animate={{
              opacity: status.isSpeaking ? [0.3, 0.8, 0.3] : 0.3,
            }}
            transition={{
              duration: 1.5,
              repeat: status.isSpeaking ? Infinity : 0,
            }}
          />

          {/* Listening indicator */}
          {status.isListening && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Voice support indicator */}
        {!isVoiceSupported && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <VolumeX className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Status Display */}
      <div className="text-center space-y-2">
        <motion.p
          key={status.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cinzel text-lg text-foreground"
        >
          {status.message}
        </motion.p>

        {status.questionsRemaining > 0 && storyStarted && (
          <p className="font-crimson text-sm text-muted-foreground">
            {status.questionsRemaining} questions remaining
          </p>
        )}

        {!isVoiceSupported && (
          <p className="font-crimson text-xs text-red-400">
            Voice features not supported in this browser
          </p>
        )}

        {status.isListening && (
          <p className="font-crimson text-xs text-green-400 animate-pulse">
            🎤 Speak now... (speak clearly and loudly)
          </p>
        )}
      </div>

      {/* Control Buttons */}
      {storyStarted && (
        <div className="flex gap-4 flex-wrap justify-center">
          {status.state === 'listening' && (
            <Button
              onClick={handleStopListening}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              Stop Listening
            </Button>
          )}

          {(status.state === 'speaking' || status.state === 'narrating') && (
            <Button
              onClick={handleStopAudio}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <VolumeX className="w-4 h-4" />
              Stop Audio
            </Button>
          )}

          {status.state === 'idle' && status.questionsRemaining > 0 && (
            <Button
              onClick={handleOrbClick}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Ask Question
            </Button>
          )}

          {/* Skip to Accusation Button - Available anytime after story starts */}
          <Button
            onClick={handleSkipToAccusation}
            variant="secondary"
            size="sm"
            className={`flex items-center gap-2 transition-all duration-300 ${
              status.questionsRemaining < 3 
                ? 'bg-amber-600/30 hover:bg-amber-600/40 border-amber-500/50 text-amber-100 shadow-lg' 
                : 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-200'
            }`}
          >
            <Skull className="w-4 h-4" />
            {status.questionsRemaining < 3 ? 'Ready to Accuse?' : 'Skip to Accusation'}
          </Button>
        </div>
      )}

      {/* Debug Panel (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4">
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="sm"
            className="text-xs mr-2"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
          
          <Button
            onClick={handleTestGemini}
            variant="ghost"
            size="sm"
            className="text-xs mr-2"
          >
            Test Gemini API
          </Button>
          
          <Button
            onClick={handleTestElevenLabs}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Test ElevenLabs
          </Button>
          
          {showDebug && (
            <div className="mt-2 p-3 bg-black/50 rounded-lg text-xs font-mono max-w-md">
              <div className="mb-2">
                <strong>State:</strong> {status.state}<br />
                <strong>Questions:</strong> {status.questionsRemaining}/3<br />
                <strong>Listening:</strong> {status.isListening ? 'Yes' : 'No'}<br />
                <strong>Speaking:</strong> {status.isSpeaking ? 'Yes' : 'No'}
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {status.debugLog.map((log, i) => (
                  <div key={i} className="text-green-400">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-amber-500" />
              Skip to Accusation?
            </DialogTitle>
            <DialogDescription>
              {status.questionsRemaining === 3 
                ? "Are you sure you want to skip all questions and go directly to making your accusation? You might miss important clues that could help solve the mystery."
                : status.questionsRemaining === 0
                ? "You've used all your questions! Time to make your accusation based on what you've learned."
                : `You've asked ${3 - status.questionsRemaining} question${3 - status.questionsRemaining > 1 ? 's' : ''} so far. Are you ready to make your accusation, or do you want to ask the remaining ${status.questionsRemaining} question${status.questionsRemaining > 1 ? 's' : ''}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={handleCancelSkip}
              variant="outline"
              className="flex-1"
            >
              {status.questionsRemaining === 0 ? 'Cancel' : 'Ask More Questions'}
            </Button>
            <Button
              onClick={handleConfirmSkip}
              variant="secondary"
              className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-200"
            >
              {status.questionsRemaining === 0 ? 'Make Accusation' : 'Skip to Accusation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}