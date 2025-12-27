import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { FogOverlay } from './FogOverlay';
import { MURDER_CASES } from '@/data/cases';

interface LevelMapProps {
  unlockedLevels: number[];
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
}

export function LevelMap({ unlockedLevels, completedLevels, onSelectLevel }: LevelMapProps) {
  const levels = MURDER_CASES.map(c => ({
    level: c.level,
    title: c.title,
    subtitle: c.subtitle,
  }));

  // Add placeholder locked levels
  const allLevels = [
    ...levels,
    { level: 3, title: 'The Crimson Chapel', subtitle: 'Faith turned to fury' },
    { level: 4, title: 'Shadows of the Stage', subtitle: 'The final act awaits' },
    { level: 5, title: 'The Collector\'s End', subtitle: 'Some treasures cost everything' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, 
            hsl(270 20% 10%) 0%, 
            hsl(240 10% 4%) 100%)`,
        }}
      />

      <FogOverlay intensity="heavy" />

      {/* Title */}
      <motion.div
        className="relative z-10 pt-16 pb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="font-cinzel text-4xl md:text-5xl text-foreground text-glow tracking-wider">
          The Path of Truth
        </h1>
        <p className="mt-4 font-crimson text-lg text-muted-foreground italic">
          Each shadow hides a story. Each story hides a killer.
        </p>
      </motion.div>

      {/* Level nodes */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 py-12">
        {allLevels.map((level, index) => {
          const isUnlocked = unlockedLevels.includes(level.level);
          const isCompleted = completedLevels.includes(level.level);
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={level.level}
              className={`flex items-center gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:w-[600px]`}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {/* Connecting line */}
              {index > 0 && (
                <div 
                  className="hidden md:block absolute h-16 w-px bg-gradient-to-b from-muted/50 to-transparent"
                  style={{ 
                    top: `${index * 140 + 60}px`,
                    left: '50%',
                  }}
                />
              )}

              {/* Level node */}
              <motion.button
                onClick={() => isUnlocked && onSelectLevel(level.level)}
                disabled={!isUnlocked}
                className={`
                  relative group flex items-center justify-center
                  w-20 h-20 rounded-full
                  transition-all duration-500
                  ${isUnlocked 
                    ? 'cursor-pointer' 
                    : 'cursor-not-allowed'}
                `}
                whileHover={isUnlocked ? { scale: 1.1 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
              >
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isCompleted
                        ? 'radial-gradient(circle, hsl(43 80% 55% / 0.4) 0%, transparent 70%)'
                        : 'radial-gradient(circle, hsl(0 70% 32% / 0.4) 0%, transparent 70%)',
                      boxShadow: isCompleted
                        ? '0 0 40px hsl(43 80% 55% / 0.3)'
                        : '0 0 40px hsl(0 70% 32% / 0.3)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Node circle */}
                <div
                  className={`
                    relative z-10 w-16 h-16 rounded-full
                    flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isUnlocked
                      ? isCompleted
                        ? 'border-accent bg-accent/20'
                        : 'border-primary bg-primary/20 group-hover:bg-primary/30'
                      : 'border-muted/30 bg-muted/10'}
                  `}
                >
                  {isUnlocked ? (
                    <span className={`font-cinzel text-2xl ${isCompleted ? 'text-accent' : 'text-primary-foreground'}`}>
                      {level.level}
                    </span>
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
              </motion.button>

              {/* Level info */}
              <div className={`text-center md:text-left ${!isLeft && 'md:text-right'}`}>
                <h3 className={`font-cinzel text-lg ${isUnlocked ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {level.title}
                </h3>
                <p className={`font-crimson text-sm italic ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>
                  {isUnlocked ? level.subtitle : 'This truth is not yet revealed...'}
                </p>
                {isCompleted && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-cinzel bg-accent/20 text-accent rounded">
                    SOLVED
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
