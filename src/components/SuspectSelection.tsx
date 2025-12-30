/**
 * Suspect Selection Component
 * Displays all suspects in a grid for selection and accusation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Eye, Gavel, AlertTriangle } from 'lucide-react';
import type { Suspect } from '@/data/cases';

interface SuspectSelectionProps {
  suspects: Suspect[];
  selectedSuspect: string | null;
  onSelectSuspect: (suspectId: string) => void;
  onAccuse: () => void;
  disabled?: boolean;
}

export function SuspectSelection({ 
  suspects, 
  selectedSuspect, 
  onSelectSuspect, 
  onAccuse,
  disabled = false 
}: SuspectSelectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [viewingSuspect, setViewingSuspect] = useState<Suspect | null>(null);

  const handleAccuse = () => {
    if (selectedSuspect) {
      setShowConfirmation(true);
    }
  };

  const confirmAccusation = () => {
    setShowConfirmation(false);
    onAccuse();
  };

  const selectedSuspectData = suspects.find(s => s.id === selectedSuspect);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Suspect</h2>
        <p className="text-gray-300">
          Based on your investigation, who do you believe is the murderer?
        </p>
      </div>

      {/* Suspect Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {suspects.map((suspect) => (
          <motion.div
            key={suspect.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                selectedSuspect === suspect.id
                  ? 'ring-2 ring-red-500 bg-red-950/20 border-red-500'
                  : 'hover:ring-1 hover:ring-gray-400 bg-gray-900/50 border-gray-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onSelectSuspect(suspect.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{suspect.name}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingSuspect(suspect);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {suspect.title}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Suspect Silhouette */}
                  <div className="w-full h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full opacity-60" />
                  </div>
                  
                  {/* Quick Info */}
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Motive:</p>
                    <p className="line-clamp-2">{suspect.motive}</p>
                  </div>
                  
                  {/* Selection Indicator */}
                  {selectedSuspect === suspect.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center py-2"
                    >
                      <Badge variant="destructive" className="text-xs">
                        SELECTED
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-4">
        {selectedSuspect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-gray-300 mb-4">
              You have selected <span className="text-red-400 font-bold">{selectedSuspectData?.name}</span>
            </p>
            <Button
              onClick={handleAccuse}
              disabled={disabled}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              <Gavel className="mr-2 h-5 w-5" />
              Make Accusation
            </Button>
          </motion.div>
        )}
        
        {!selectedSuspect && (
          <p className="text-gray-500 text-center">
            Select a suspect above to make your accusation
          </p>
        )}
      </div>

      {/* Suspect Detail Modal */}
      <Dialog open={!!viewingSuspect} onOpenChange={() => setViewingSuspect(null)}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          {viewingSuspect && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">
                  {viewingSuspect.name}
                </DialogTitle>
                <Badge variant="secondary" className="w-fit">
                  {viewingSuspect.title}
                </Badge>
              </DialogHeader>
              
              <ScrollArea className="max-h-96">
                <div className="space-y-6 pr-4">
                  {/* Appearance */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Appearance</h4>
                    <p className="text-gray-300">{viewingSuspect.appearance}</p>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Alibi */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Alibi</h4>
                    <p className="text-gray-300">{viewingSuspect.alibi}</p>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Motive */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Motive</h4>
                    <p className="text-gray-300">{viewingSuspect.motive}</p>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  {/* Clues */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Evidence & Clues</h4>
                    <ul className="space-y-2">
                      {viewingSuspect.clues.map((clue, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-gray-300">{clue}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingSuspect(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onSelectSuspect(viewingSuspect.id);
                    setViewingSuspect(null);
                  }}
                  disabled={disabled}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Select This Suspect
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Confirm Your Accusation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              You are about to accuse <span className="text-red-400 font-bold">{selectedSuspectData?.name}</span> of murder.
            </p>
            <p className="text-yellow-300 text-sm">
              This decision is final and will determine if you solve the case correctly.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAccusation}
              className="bg-red-600 hover:bg-red-700"
            >
              <Gavel className="mr-2 h-4 w-4" />
              Confirm Accusation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}