import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelMap } from '@/components/LevelMap';
import { InteractiveOrb } from '@/components/InteractiveOrb';
import { FogOverlay } from '@/components/FogOverlay';
import { SuspectSelection } from '@/components/SuspectSelection';
import { DebateMode } from '@/components/DebateMode';
import { DebateCongratulation } from '@/components/DebateCongratulation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCaseByLevel } from '@/data/cases';
import type { MurderCase } from '@/data/cases';
import { ArrowLeft, Skull, Settings, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { VoiceSettings } from '@/components/VoiceSettings';
import { useGameState } from '@/hooks/useGameState';

type GameScreen = 
  | 'map' 
  | 'intro' 
  | 'interrogation' 
  | 'accusation' 
  | 'reveal'
  | 'debate-intro'
  | 'debate';

interface Message {
  id: string;
  type: 'player' | 'orb' | 'system';
  text: string;
  timestamp: Date;
}

const MurderMysteryGame = () => {
  const [screen, setScreen] = useState<GameScreen>('map');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [hasSeenDebateIntro, setHasSeenDebateIntro] = useState(false);
  
  // Use the game state hook
  const {
    progress,
    session,
    startCase,
    selectSuspect,
    addQuestion,
    addClue,
    completeCase,
    resetSession,
    isLevelUnlocked,
    getSessionStats
  } = useGameState();

  const handleSelectLevel = useCallback((level: number) => {
    if (!isLevelUnlocked(level)) return;
    
    if (level === 4) {
      // Handle debate level selection - show intro first time
      if (!hasSeenDebateIntro) {
        setScreen('debate-intro');
      } else {
        setScreen('debate');
      }
    } else {
      // Handle mystery level selection
      const caseData = getCaseByLevel(level);
      if (caseData) {
        startCase(caseData);
        setMessages([]);
        setScreen('intro');
      }
    }
  }, [isLevelUnlocked, startCase, hasSeenDebateIntro]);

  const handleQuestionAsked = useCallback((question: string) => {
    const message: Message = {
      id: `player-${Date.now()}`,
      type: 'player',
      text: question,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
    addQuestion();
  }, [addQuestion]);

  const handleResponseReceived = useCallback((response: string) => {
    const message: Message = {
      id: `orb-${Date.now()}`,
      type: 'orb',
      text: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
    
    // Extract clues from response (simple keyword matching)
    const keywords = ['evidence', 'clue', 'witness', 'alibi', 'motive'];
    if (keywords.some(keyword => response.toLowerCase().includes(keyword))) {
      addClue(response.substring(0, 100) + '...');
    }
  }, [addClue]);

  const handleInterrogationComplete = useCallback(() => {
    setScreen('accusation');
  }, []);

  const handleSuspectSelected = useCallback((suspectId: string) => {
    selectSuspect(suspectId);
  }, [selectSuspect]);

  const handleAccusation = useCallback(() => {
    if (!session.currentCase || !session.selectedSuspect) return;
    
    const isCorrect = session.selectedSuspect === session.currentCase.trueMurderer;
    completeCase(isCorrect);
    setScreen('reveal');
  }, [session.currentCase, session.selectedSuspect, completeCase]);

  const handleReturnToMap = useCallback(() => {
    resetSession();
    setMessages([]);
    setScreen('map');
  }, [resetSession]);

  const handleEnterDebate = useCallback(() => {
    setHasSeenDebateIntro(true);
    setScreen('debate');
  }, []);

  const handleBackFromDebate = useCallback(() => {
    setScreen('map');
  }, []);

  // Render different screens
  const renderScreen = () => {
    switch (screen) {
      case 'map':
        return (
          <LevelMap
            unlockedLevels={progress.unlockedLevels}
            completedLevels={progress.completedLevels}
            onSelectLevel={handleSelectLevel}
          />
        );

      case 'intro':
        return session.currentCase ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 60% 60% at 50% 40%, 
                  hsl(270 20% 8%) 0%, 
                  hsl(240 10% 4%) 100%)`,
              }}
            />
            <FogOverlay intensity="medium" />

            <motion.button
              onClick={handleReturnToMap}
              className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-crimson">Return</span>
            </motion.button>

            <div className="w-full max-w-4xl relative z-10">
              <InteractiveOrb
                murderCase={session.currentCase}
                onQuestionAsked={handleQuestionAsked}
                onResponseReceived={handleResponseReceived}
                onComplete={handleInterrogationComplete}
                size="large"
              />
              
              {/* Case Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  {session.currentCase.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {session.currentCase.subtitle}
                </p>
                <Badge variant="secondary" className="mb-4">
                  Level {session.currentCase.level}
                </Badge>
                
                {/* Progress Indicator */}
                <div className="flex justify-center space-x-2 mt-4">
                  <Badge variant={session.questionsAsked >= 1 ? "default" : "outline"}>
                    Question 1
                  </Badge>
                  <Badge variant={session.questionsAsked >= 2 ? "default" : "outline"}>
                    Question 2
                  </Badge>
                  <Badge variant={session.questionsAsked >= 3 ? "default" : "outline"}>
                    Question 3
                  </Badge>
                </div>
              </motion.div>

              {/* Conversation History */}
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full max-w-2xl mx-auto max-h-64 overflow-y-auto space-y-3"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.type === 'player' 
                          ? 'bg-primary/10 border border-primary/20 ml-8' 
                          : 'bg-card/50 border border-border/30 mr-8'
                      }`}
                    >
                      <p className="font-crimson text-sm text-foreground/90">
                        {message.text}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        ) : null;

      case 'accusation':
        return session.currentCase ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <motion.button
              onClick={handleReturnToMap}
              className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Return to Map</span>
            </motion.button>

            <SuspectSelection
              suspects={session.currentCase.suspects}
              selectedSuspect={session.selectedSuspect}
              onSelectSuspect={handleSuspectSelected}
              onAccuse={handleAccusation}
            />
          </div>
        ) : null;

      case 'reveal':
        return session.currentCase ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {session.isCorrect ? (
                      <CheckCircle className="h-16 w-16 text-green-400" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-400" />
                    )}
                  </div>
                  <CardTitle className="text-2xl text-white">
                    {session.isCorrect ? 'Case Solved!' : 'Case Unsolved'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      {session.isCorrect 
                        ? `Congratulations! You correctly identified ${session.currentCase.suspects.find(s => s.id === session.selectedSuspect)?.name} as the murderer.`
                        : `The real murderer was ${session.currentCase.suspects.find(s => s.id === session.currentCase.trueMurderer)?.name}.`
                      }
                    </p>
                    
                    {/* Session Stats */}
                    {(() => {
                      const stats = getSessionStats();
                      return stats ? (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-800 p-3 rounded">
                            <div className="text-lg font-bold text-white">{stats.duration}</div>
                            <div className="text-sm text-gray-400">Time Taken</div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded">
                            <div className="text-lg font-bold text-white">{stats.questionsUsed}/3</div>
                            <div className="text-sm text-gray-400">Questions Used</div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  
                  {/* Solution */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">The Solution:</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {session.currentCase.solution}
                    </p>
                  </div>
                  
                  {/* Level Progress */}
                  {session.isCorrect && session.currentCase.level < 3 && (
                    <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg">
                      <div className="flex items-center text-green-400 mb-2">
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Level Unlocked!</span>
                      </div>
                      <p className="text-green-300 text-sm">
                        You've unlocked Level {session.currentCase.level + 1}. Continue your detective journey!
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Button onClick={handleReturnToMap} className="px-8">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Return to Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : null;

      case 'debate-intro':
        return <DebateCongratulation 
          onEnterDebate={handleEnterDebate}
          completedLevels={progress.completedLevels}
        />;

      case 'debate':
        return <DebateMode onBack={handleBackFromDebate} />;

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-white">Screen: {screen}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <VoiceSettings 
        isOpen={showVoiceSettings} 
        onClose={() => setShowVoiceSettings(false)} 
      />
      
      <AnimatePresence mode="wait">
        {/* Settings Button (only on map screen) */}
        {screen === 'map' && (
          <motion.button
            onClick={() => setShowVoiceSettings(true)}
            className="fixed top-6 right-6 z-20 p-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        )}

        {/* Main Screen Content */}
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MurderMysteryGame;