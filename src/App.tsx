/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Music, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { playNote } from './lib/sound';

type Screen = 'TITLE' | 'GAME' | 'SCORE';

const NOTES = ['DÓ', 'RÉ', 'MI', 'FÁ', 'SOL', 'LÁ', 'SI'] as const;
type NoteName = typeof NOTES[number];

const NOTE_COLORS: Record<NoteName, string> = {
  'DÓ': 'bg-red-500',
  'RÉ': 'bg-orange-500',
  'MI': 'bg-yellow-400',
  'FÁ': 'bg-green-500',
  'SOL': 'bg-blue-500',
  'LÁ': 'bg-indigo-600',
  'SI': 'bg-purple-600',
};

const NOTE_Y_POSITIONS: Record<NoteName, number> = {
  'DÓ': 120, // Ledger line
  'RÉ': 110, // Below 1st line
  'MI': 100, // 1st line
  'FÁ': 90,  // 1st space
  'SOL': 80, // 2nd line
  'LÁ': 70,  // 2nd space
  'SI': 60,  // 3rd line
};

// SVG for Treble Clef
const TrebleClef = () => (
  <path
    d="M 10 140 C 10 155 25 155 25 140 C 25 110 15 90 15 50 C 15 20 35 5 45 5 C 55 5 65 20 65 45 C 65 90 20 100 20 135 C 20 165 50 185 80 185 C 110 185 135 160 135 125 C 135 85 100 70 80 70 C 60 70 45 85 45 110 C 45 135 60 150 80 150 C 95 150 105 140 105 120 L 105 5 C 105 -5 90 -10 80 0 C 70 10 60 35 60 80 L 60 200"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    transform="translate(45, 10) scale(0.5)"
  />
);

const Staff = ({ currentNote }: { currentNote: NoteName }) => {
  const y = NOTE_Y_POSITIONS[currentNote];
  
  return (
    <div className="relative w-full aspect-[2/1] bg-white rounded-2xl shadow-inner border-4 border-gray-100 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 200" className="w-full h-full text-zinc-800">
        {/* Draw 5 lines */}
        {[20, 40, 60, 80, 100].map((lineY) => (
          <line
            key={lineY}
            x1="20"
            y1={lineY}
            x2="380"
            y2={lineY}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        ))}
        
        <TrebleClef />

        {/* Draw Ledger Line for DÓ */}
        {currentNote === 'DÓ' && (
          <line
            x1="185"
            y1="120"
            x2="215"
            y2="120"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}

        {/* Draw Note */}
        <motion.circle
          key={currentNote}
          initial={{ opacity: 0, scale: 0.5, x: 250 }}
          animate={{ opacity: 1, scale: 1, x: 200 }}
          cx="0"
          cy={y}
          r="8"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('TITLE');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [currentNote, setCurrentNote] = useState<NoteName>('DÓ');
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [history, setHistory] = useState<NoteName[]>([]);

  const TOTAL_ROUNDS = 10;

  const nextRound = useCallback(() => {
    if (round < TOTAL_ROUNDS - 1) {
      // Avoid repeating the last 2 notes for variety
      const forbidden = history.slice(-2);
      const possibleNotes = NOTES.filter(note => !forbidden.includes(note));
      const nextNote = possibleNotes[Math.floor(Math.random() * possibleNotes.length)];
      
      setCurrentNote(nextNote);
      setHistory(prev => [...prev, nextNote]);
      setRound(r => r + 1);
      setFeedback(null);
    } else {
      setScreen('SCORE');
    }
  }, [round, history]);

  const handleGuess = (guess: NoteName) => {
    if (feedback) return; // Prevent double clicking during animation

    playNote(guess);
    
    if (guess === currentNote) {
      setScore(s => s + 1);
      setFeedback('CORRECT');
    } else {
      setFeedback('WRONG');
    }

    // Delay move to next round for feedback
    setTimeout(() => {
      nextRound();
    }, 800);
  };

  const startGame = () => {
    setScore(0);
    setRound(0);
    setFeedback(null);
    const firstNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    setCurrentNote(firstNote);
    setHistory([firstNote]);
    setScreen('GAME');
  };

  const resetToTitle = () => {
    setScreen('TITLE');
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-zinc-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Room Atmosphere */}
      <div className="absolute inset-0 opacity-40 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-200 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 blur-[100px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {screen === 'TITLE' && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center flex flex-col items-center gap-8 relative z-10"
          >
            <div className="bg-white p-12 rounded-[3rem] shadow-xl border-4 border-white flex flex-col items-center gap-4">
               <div className="flex items-center gap-2 mb-2">
                 <div className="border-2 border-zinc-400 p-1 font-mono text-xs font-bold leading-none">ASP</div>
                 <span className="font-mono text-xl tracking-tighter uppercase font-black">GAMES</span>
               </div>
               <h1 className="text-7xl font-black tracking-tighter flex flex-col leading-[0.8]">
                 <span className="text-[#FF5C5C] italic">Play!</span>
                 <span className="text-[#2F6666]">Music</span>
               </h1>
               <div className="mt-4 text-yellow-500">
                 <Music size={48} strokeWidth={3} />
               </div>
            </div>

            <button
              onClick={startGame}
              className="bg-[#FF6B00] text-white px-12 py-5 rounded-3xl text-4xl font-black shadow-[0_10px_0_0_#B34B00] hover:translate-y-1 hover:shadow-[0_6px_0_0_#B34B00] transition-all active:translate-y-2 active:shadow-none"
            >
              Começar
            </button>
          </motion.div>
        )}

        {screen === 'GAME' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl flex flex-col gap-6 relative z-10"
          >
            <div className="flex justify-between items-center bg-white px-6 py-4 rounded-3xl shadow-sm border-2 border-gray-100">
              <button 
                onClick={resetToTitle}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 font-bold uppercase text-sm"
              >
                <ArrowLeft size={20} strokeWidth={3} /> Voltar
              </button>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">PONTOS</span>
                  <span className="text-2xl font-black text-[#2F6666] leading-none">{score}</span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">ROUND</span>
                  <span className="text-2xl font-black text-[#FF6B00] leading-none">{round + 1}/10</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Staff currentNote={currentNote} />
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    {feedback === 'CORRECT' ? (
                      <CheckCircle2 className="text-green-500 w-32 h-32 drop-shadow-lg" strokeWidth={3} />
                    ) : (
                      <XCircle className="text-red-500 w-32 h-32 drop-shadow-lg" strokeWidth={3} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-7 gap-2 h-48">
              {NOTES.map((note) => (
                <button
                  key={note}
                  onClick={() => handleGuess(note as NoteName)}
                  disabled={!!feedback}
                  className={`
                    ${NOTE_COLORS[note as NoteName]} 
                    rounded-2xl flex flex-col items-center justify-end pb-6 
                    transition-all active:scale-95 shadow-[0_8px_0_0_rgba(0,0,0,0.1)]
                    hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="text-white font-black text-xs sm:text-lg drop-shadow-sm rotate-0 transform-gpu">
                    {note}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {screen === 'SCORE' && (
          <motion.div
            key="score"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border-4 border-white relative z-10"
          >
            <h2 className="text-3xl font-black text-gray-400 uppercase tracking-widest">
              {score === 10 ? 'You Won!' : 'Game Over!'}
            </h2>
            <div className="text-9xl font-black text-[#2F6666] leading-none">{score}</div>
            <p className="text-xl font-bold text-gray-500">Você acertou {score} de 10 notas!</p>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={startGame}
                className="bg-[#2F6666] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                <RotateCcw size={20} /> Jogar Novamente
              </button>
              <button
                onClick={resetToTitle}
                className="bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 active:scale-95 transition-all"
              >
                Início
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
