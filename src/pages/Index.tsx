import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelMap } from '@/components/LevelMap';
import { Orb } from '@/components/Orb';
import { FogOverlay } from '@/components/FogOverlay';
import { SuspectCard } from '@/components/SuspectCard';
import { QuestionPanel } from '@/components/QuestionPanel';
import { Button } from '@/components/ui/button';
import { getCaseByLevel } from '@/data/cases';
import type { MurderCase } from '@/data/cases';
import { ArrowLeft, Skull } from 'lucide-react';

type GameScreen = 
  | 'map' 
  | 'intro' 
  | 'briefing' 
  | 'interrogation' 
  | 'accusation' 
  | 'reveal';

interface Message {
  id: string;
  type: 'player' | 'orb';
  text: string;
}

// Placeholder responses - will be replaced by Gemini AI
const PLACEHOLDER_RESPONSES = [
  "The truth reveals itself in fragments... Consider the timing of events more carefully.",
  "Some alibis are as fragile as morning mist. Look to where each soul stood when darkness fell.",
  "The weapon speaks, if you know how to listen. Who had access? Who had knowledge?",
  "Motives are like shadows—everyone casts one. But only one shadow covers the crime.",
  "The evidence does not lie, though it may whisper rather than shout.",
];

const MurderMysteryGame = () => {
  const [screen, setScreen] = useState<GameScreen>('map');
  const [currentCase, setCurrentCase] = useState<MurderCase | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [questionsRemaining, setQuestionsRemaining] = useState(3);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const handleSelectLevel = useCallback((level: number) => {
    const caseData = getCaseByLevel(level);
    if (caseData) {
      setCurrentCase(caseData);
      setQuestionsRemaining(3);
      setMessages([]);
      setSelectedSuspect(null);
      setIntroComplete(false);
      setScreen('intro');
    }
  }, []);

  const handleAskQuestion = useCallback((question: string) => {
    if (questionsRemaining <= 0) return;

    const playerId = `player-${Date.now()}`;
    setMessages(prev => [...prev, { id: playerId, type: 'player', text: question }]);
    setIsProcessing(true);
    setQuestionsRemaining(prev => prev - 1);

    // Simulate AI response delay
    setTimeout(() => {
      const response = PLACEHOLDER_RESPONSES[Math.floor(Math.random() * PLACEHOLDER_RESPONSES.length)];
      setMessages(prev => [...prev, { 
        id: `orb-${Date.now()}`, 
        type: 'orb', 
        text: response 
      }]);
      setIsProcessing(false);
    }, 2000);
  }, [questionsRemaining]);

  const handleAccusation = useCallback(() => {
    if (!selectedSuspect || !currentCase) return;
    
    const correct = selectedSuspect === currentCase.trueMurderer;
    setIsCorrect(correct);
    setScreen('reveal');

    if (correct && currentCase) {
      setCompletedLevels(prev => [...prev, currentCase.level]);
      if (!unlockedLevels.includes(currentCase.level + 1)) {
        setUnlockedLevels(prev => [...prev, currentCase.level + 1]);
      }
    }
  }, [selectedSuspect, currentCase, unlockedLevels]);

  const returnToMap = useCallback(() => {
    setScreen('map');
    setCurrentCase(null);
    setSelectedSuspect(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        {/* MAP SCREEN */}
        {screen === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LevelMap
              unlockedLevels={unlockedLevels}
              completedLevels={completedLevels}
              onSelectLevel={handleSelectLevel}
            />
          </motion.div>
        )}

        {/* INTRO SCREEN */}
        {screen === 'intro' && currentCase && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex flex-col items-center justify-center p-8"
          >
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
              onClick={returnToMap}
              className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-crimson">Return</span>
            </motion.button>

            <div className="relative z-10 flex flex-col items-center max-w-2xl">
              <Orb size="large" speaking={!introComplete} />
              
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <h2 className="font-cinzel text-3xl md:text-4xl text-foreground text-glow mb-6">
                  {currentCase.title}
                </h2>
                
                <motion.p
                  className="font-crimson text-lg text-foreground/90 leading-relaxed italic whitespace-pre-line"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  onAnimationComplete={() => setIntroComplete(true)}
                >
                  {currentCase.introNarration}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: introComplete ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-10"
                >
                  <Button
                    onClick={() => setScreen('briefing')}
                    variant="outline"
                    size="lg"
                    className="font-cinzel border-accent/50 text-accent hover:bg-accent/10 hover:border-accent"
                  >
                    Continue
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* BRIEFING SCREEN */}
        {screen === 'briefing' && currentCase && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen p-8"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 20%, 
                  hsl(270 20% 10%) 0%, 
                  hsl(240 10% 4%) 100%)`,
              }}
            />
            <FogOverlay intensity="light" />

            <motion.button
              onClick={() => setScreen('intro')}
              className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-crimson">Back</span>
            </motion.button>

            <div className="relative z-10 max-w-4xl mx-auto pt-12">
              {/* Dimmed orb in corner */}
              <div className="absolute top-0 right-0 opacity-30">
                <Orb size="small" dimmed />
              </div>

              {/* Case details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <h2 className="font-cinzel text-3xl text-foreground text-glow mb-2">
                  Case Briefing
                </h2>
                <p className="font-crimson text-muted-foreground italic">
                  {currentCase.setting}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card/50 border border-border/50 rounded-lg p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Skull className="w-5 h-5 text-primary" />
                    <h3 className="font-cinzel text-sm text-muted-foreground uppercase tracking-wider">Victim</h3>
                  </div>
                  <p className="font-cinzel text-lg text-foreground">{currentCase.victim.name}</p>
                  <p className="font-crimson text-sm text-muted-foreground italic">{currentCase.victim.title}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/50 border border-border/50 rounded-lg p-5"
                >
                  <h3 className="font-cinzel text-sm text-muted-foreground uppercase tracking-wider mb-3">Location</h3>
                  <p className="font-crimson text-lg text-foreground">{currentCase.location}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card/50 border border-border/50 rounded-lg p-5"
                >
                  <h3 className="font-cinzel text-sm text-muted-foreground uppercase tracking-wider mb-3">Time of Death</h3>
                  <p className="font-crimson text-lg text-foreground">{currentCase.timeOfDeath}</p>
                </motion.div>
              </div>

              {/* Suspects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-cinzel text-xl text-foreground mb-6">The Suspects</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentCase.suspects.map((suspect, i) => (
                    <motion.div
                      key={suspect.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <SuspectCard suspect={suspect} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Rule reminder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 text-center"
              >
                <p className="font-cinzel text-lg text-accent mb-6">
                  You may ask ONLY THREE QUESTIONS
                </p>
                <Button
                  onClick={() => setScreen('interrogation')}
                  size="lg"
                  className="font-cinzel bg-primary hover:bg-primary/90"
                >
                  Begin Interrogation
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* INTERROGATION SCREEN */}
        {screen === 'interrogation' && currentCase && (
          <motion.div
            key="interrogation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex flex-col lg:flex-row"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 50% 50% at 30% 30%, 
                  hsl(270 20% 10%) 0%, 
                  hsl(240 10% 4%) 100%)`,
              }}
            />
            <FogOverlay intensity="light" />

            {/* Left side - Orb and suspects */}
            <div className="relative z-10 lg:w-1/2 p-6 lg:p-8 flex flex-col">
              <motion.button
                onClick={() => setScreen('briefing')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 lg:mb-8"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-crimson">Case Details</span>
              </motion.button>

              <div className="flex-1 flex flex-col items-center justify-center py-8 lg:py-0">
                <Orb size="medium" speaking={isProcessing} />
                
                <motion.p
                  className="mt-6 font-crimson text-center text-muted-foreground italic max-w-md text-sm lg:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  "Ask what you will, but choose your words with care. 
                  Truth is precious, and I grant only three glimpses."
                </motion.p>
              </div>

              {/* Mini suspect cards - horizontal scroll on mobile */}
              <div className="mt-auto">
                <h4 className="font-cinzel text-sm text-muted-foreground mb-3">Suspects</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentCase.suspects.map(suspect => (
                    <div 
                      key={suspect.id}
                      className="flex-shrink-0 w-16 h-20 rounded bg-card/50 border border-border/30 flex flex-col items-center justify-center p-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted/20" />
                      <p className="mt-1 text-[10px] font-cinzel text-muted-foreground truncate w-full text-center">
                        {suspect.name.split(' ')[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Question panel */}
            <div className="relative z-10 lg:w-1/2 bg-card/30 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-border/30 min-h-[400px] lg:min-h-0">
              <QuestionPanel
                questionsRemaining={questionsRemaining}
                messages={messages}
                onAskQuestion={handleAskQuestion}
                isProcessing={isProcessing}
                onProceedToAccusation={() => setScreen('accusation')}
              />
            </div>
          </motion.div>
        )}

        {/* ACCUSATION SCREEN */}
        {screen === 'accusation' && currentCase && (
          <motion.div
            key="accusation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex flex-col items-center justify-center p-8"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 60% 60% at 50% 50%, 
                  hsl(0 30% 8%) 0%, 
                  hsl(240 10% 4%) 100%)`,
              }}
            />
            <FogOverlay intensity="medium" />

            <motion.button
              onClick={() => setScreen('interrogation')}
              className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-crimson">Back</span>
            </motion.button>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <Orb size="medium" speaking />
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 font-cinzel text-3xl text-foreground text-glow"
              >
                Speak the truth you believe
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 font-crimson text-lg text-muted-foreground italic"
              >
                Select the one you accuse of this murder
              </motion.p>

              {/* Suspect selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 justify-center"
              >
                {currentCase.suspects.map((suspect) => (
                  <SuspectCard
                    key={suspect.id}
                    suspect={suspect}
                    isSelected={selectedSuspect === suspect.id}
                    onClick={() => setSelectedSuspect(suspect.id)}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10"
              >
                <Button
                  onClick={handleAccusation}
                  disabled={!selectedSuspect}
                  size="lg"
                  variant="destructive"
                  className="font-cinzel text-lg px-8"
                >
                  REVEAL THE TRUTH
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* REVEAL SCREEN */}
        {screen === 'reveal' && currentCase && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative min-h-screen flex flex-col items-center justify-center p-8"
          >
            <div 
              className="absolute inset-0"
              style={{
                background: isCorrect
                  ? `radial-gradient(ellipse 60% 60% at 50% 50%, 
                      hsl(43 30% 10%) 0%, 
                      hsl(240 10% 4%) 100%)`
                  : `radial-gradient(ellipse 60% 60% at 50% 50%, 
                      hsl(0 40% 8%) 0%, 
                      hsl(240 10% 4%) 100%)`,
              }}
            />
            <FogOverlay intensity="light" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Orb size="large" speaking />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <h2 className={`mt-10 font-cinzel text-4xl ${isCorrect ? 'text-accent text-glow' : 'text-primary text-blood-glow'}`}>
                  {isCorrect ? 'Truth Unveiled' : 'The Shadows Deceive'}
                </h2>
                
                <p className="mt-6 font-crimson text-xl text-foreground/90 italic leading-relaxed">
                  {isCorrect ? currentCase.revealNarration : 
                    `Your accusation falls upon ${currentCase.suspects.find(s => s.id === selectedSuspect)?.name}, but the true shadow of guilt belongs to another. The murderer was ${currentCase.suspects.find(s => s.id === currentCase.trueMurderer)?.name}.`}
                </p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="mt-8 p-6 bg-card/30 rounded-lg border border-border/50"
                >
                  <h3 className="font-cinzel text-lg text-muted-foreground mb-3">The Solution</h3>
                  <p className="font-crimson text-foreground/80">
                    {currentCase.solution}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="mt-10"
                >
                  {isCorrect && (
                    <p className="mb-4 font-cinzel text-accent">
                      Level {currentCase.level + 1} has been unlocked
                    </p>
                  )}
                  <Button
                    onClick={returnToMap}
                    variant="outline"
                    size="lg"
                    className="font-cinzel border-accent/50 text-accent hover:bg-accent/10"
                  >
                    Return to Map
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MurderMysteryGame;
