'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Color, getRandomColor, calculateScore, colorToRgb } from '../lib/game-logic';
import { ColorDisplay } from './ColorDisplay';
import { ColorSliders } from './ColorSliders';

type GameState = 'START' | 'SHOWING' | 'MATCHING' | 'RESULT' | 'FINAL';

const ROUNDS_LIMIT = 5;
const SHOW_DURATION = 3000; // 3 seconds

export const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [round, setRound] = useState(1);
  const [targetColor, setTargetColor] = useState<Color>({ r: 0, g: 0, b: 0 });
  const [userColor, setUserColor] = useState<Color>({ r: 127, g: 127, b: 127 });
  const [scores, setScores] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(SHOW_DURATION / 1000);

  const startNewRound = useCallback(() => {
    const nextColor = getRandomColor();
    setTargetColor(nextColor);
    setUserColor({ r: 127, g: 127, b: 127 });
    setGameState('SHOWING');
    setTimeLeft(SHOW_DURATION / 1000);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'SHOWING' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'SHOWING' && timeLeft === 0) {
      setGameState('MATCHING');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const handleMatch = () => {
    const score = calculateScore(targetColor, userColor);
    setScores(prev => [...prev, score]);
    setGameState('RESULT');
  };

  const nextAction = () => {
    if (round < ROUNDS_LIMIT) {
      setRound(prev => prev + 1);
      startNewRound();
    } else {
      setGameState('FINAL');
    }
  };

  const resetGame = () => {
    setRound(1);
    setScores([]);
    setGameState('START');
  };

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const avgScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : '0';

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl min-h-[600px]">
      {gameState === 'START' && (
        <div className="text-center animate-fade-in space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter">
              MATCH<span className="text-blue-500">IT.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Test your vision. You'll have 3 seconds to memorize a color, then you must recreate it.
            </p>
          </div>
          <button 
            onClick={startNewRound}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
          >
            Start Game
          </button>
        </div>
      )}

      {(gameState === 'SHOWING' || gameState === 'MATCHING' || gameState === 'RESULT') && (
        <div className="w-full flex flex-col items-center gap-12">
          {/* Header Info */}
          <div className="flex justify-between w-full max-w-2xl px-4 animate-fade-in">
            <div className="glass px-4 py-2 rounded-xl">
              <span className="text-slate-400 text-xs font-bold uppercase">Round</span>
              <p className="text-white font-mono text-xl">{round} / {ROUNDS_LIMIT}</p>
            </div>
            <div className="glass px-4 py-2 rounded-xl">
              <span className="text-slate-400 text-xs font-bold uppercase">Total Score</span>
              <p className="text-white font-mono text-xl">{totalScore}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-center justify-center">
            {/* Target Color */}
            <div className={`relative ${gameState === 'MATCHING' ? 'opacity-20 transition-opacity' : 'opacity-100'}`}>
              <ColorDisplay color={targetColor} label="Target Color" showDetails={gameState === 'RESULT'} />
              {gameState === 'SHOWING' && (
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg animate-pulse">
                  {timeLeft}
                </div>
              )}
            </div>

            {/* Match Action or Result */}
            {(gameState === 'MATCHING' || gameState === 'RESULT') && (
              <div className="flex flex-col items-center gap-8">
                <ColorDisplay color={userColor} label="Your Match" showDetails={gameState === 'RESULT'} />
                
                {gameState === 'MATCHING' ? (
                  <ColorSliders color={userColor} onChange={setUserColor} />
                ) : (
                  <div className="glass p-6 rounded-3xl text-center animate-slide-up w-full max-w-[280px]">
                    <p className="text-slate-400 text-sm font-bold uppercase mb-1">Round Score</p>
                    <p className="text-6xl font-black text-blue-500 mb-6">{scores[scores.length - 1]}</p>
                    <button 
                      onClick={nextAction}
                      className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      {round === ROUNDS_LIMIT ? 'See Results' : 'Next Round'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {gameState === 'MATCHING' && (
            <button 
              onClick={handleMatch}
              className="mt-8 px-12 py-4 bg-white text-black rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Match!
            </button>
          )}
        </div>
      )}

      {gameState === 'FINAL' && (
        <div className="text-center animate-fade-in space-y-12 w-full max-w-md">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-white">Game Over!</h2>
            <p className="text-slate-400">Here's how you performed across {ROUNDS_LIMIT} rounds.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-6 rounded-2xl">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Score</p>
              <p className="text-4xl font-black text-white">{totalScore}</p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Average</p>
              <p className="text-4xl font-black text-blue-500">{avgScore}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Score Breakdown</p>
            <div className="flex justify-center gap-2">
              {scores.map((s, i) => (
                <div key={i} className="w-10 h-10 rounded-lg glass flex items-center justify-center font-mono text-sm text-white">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xl transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
