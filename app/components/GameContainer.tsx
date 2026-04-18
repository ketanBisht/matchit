'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Color, getRandomColor, calculateScore, colorToRgb, getMatchPercentage } from '../lib/game-logic';
import { ColorDisplay } from './ColorDisplay';
import { ColorPicker } from './ColorPicker';

type GameState = 'START' | 'SHOWING' | 'MATCHING' | 'RESULT' | 'FINAL';

const ROUNDS_LIMIT = 5;
const SHOW_DURATION = 3000;

export const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [round, setRound] = useState(1);
  const [targetColor, setTargetColor] = useState<Color>({ r: 0, g: 0, b: 0 });
  const [userColor, setUserColor] = useState<Color>({ r: 127, g: 127, b: 127 });
  const [scores, setScores] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(SHOW_DURATION / 1000);
  const [showRules, setShowRules] = useState(false);

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
  const currentMatchPercent = getMatchPercentage(targetColor, userColor);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl min-h-[600px] gap-8">
      {gameState === 'START' && (
        <div className="text-center animate-fade-in space-y-12">
          {!showRules ? (
            <div className="space-y-12">
              <div className="space-y-4">
                <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter">
                  MATCH<span className="text-blue-500">IT.</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-md mx-auto font-medium">
                  Test your color memory. Master your vision.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={startNewRound}
                  className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(37,99,235,0.4)]"
                >
                  START GAME
                </button>
                <button 
                  onClick={() => setShowRules(true)}
                  className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em]"
                >
                  How to Play?
                </button>
              </div>
            </div>
          ) : (
            /* RULES VIEW */
            <div className="glass p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl animate-slide-up max-w-lg">
              <h2 className="text-3xl font-black text-white mb-8 tracking-tighter italic">GAME RULES</h2>
              <ul className="text-left space-y-6 mb-10">
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 font-black text-white">1</span>
                  <p className="text-slate-300 font-medium">Memorize the <span className="text-white font-bold">Target Color</span> shown for 3 seconds.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 font-black text-white">2</span>
                  <p className="text-slate-300 font-medium">Recreate it using the <span className="text-white font-bold">Color Wheel</span> and <span className="text-white font-bold">Brightness Slider</span>.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 font-black text-white">3</span>
                  <p className="text-slate-300 font-medium">The closer your match, the <span className="text-white font-bold">Higher your score</span>.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 font-black text-white">4</span>
                  <p className="text-slate-300 font-medium">Complete <span className="text-white font-bold">5 Rounds</span> to see your total and average accuracy.</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowRules(false)}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all text-lg"
              >
                GOT IT
              </button>
            </div>
          )}
        </div>
      )}

      {(gameState === 'SHOWING' || gameState === 'MATCHING' || gameState === 'RESULT') && (
        <div className="w-full flex flex-col items-center gap-8 md:gap-12 animate-fade-in">
          {/* Header Info */}
          <div className="flex justify-between w-full max-w-2xl px-2 relative z-20">
            <div className="glass px-5 py-3 rounded-2xl border border-white/10">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Round</span>
              <p className="text-white font-mono text-2xl leading-none mt-1">{round} / {ROUNDS_LIMIT}</p>
            </div>
            <div className="glass px-5 py-3 rounded-2xl border border-white/10">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total</span>
              <p className="text-white font-mono text-2xl leading-none mt-1">{totalScore}</p>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-8">
            {gameState === 'RESULT' ? (
              /* COMPARISON VIEW */
              <div className="flex flex-col items-center gap-10 w-full translate-y-[-20px]">
                <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-center justify-center w-full">
                  <div className="flex-1 flex flex-col items-center gap-4">
                    <ColorDisplay color={targetColor} label="Target" showDetails />
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 glass rounded-full aspect-square w-20 h-20 md:w-28 md:h-28 z-10 mx-[-30px] border border-white/20 shadow-2xl backdrop-blur-xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Match</span>
                    <span className="text-xl md:text-3xl font-black text-white">{currentMatchPercent}%</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-4">
                    <ColorDisplay color={userColor} label="Yours" showDetails />
                  </div>
                </div>

                <div className="glass p-10 rounded-[3rem] text-center animate-slide-up w-full max-w-sm border border-white/10 shadow-2xl">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Round Score</p>
                  <p className="text-8xl font-black text-blue-500 mb-8 tracking-tighter">{scores[scores.length - 1]}</p>
                  <button 
                    onClick={nextAction}
                    className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all hover:scale-[1.02] active:scale-95 shadow-lg text-xl"
                  >
                    {round === ROUNDS_LIMIT ? 'See Final Stats' : 'Next Round'}
                  </button>
                </div>
              </div>
            ) : (
              /* PLAY VIEW - Shifted up by removing Memory Mode box */
              <div className="flex flex-col items-center gap-8 w-full translate-y-[-20px] md:translate-y-[-40px]">
                <div className="relative">
                  {gameState === 'SHOWING' && (
                    <div className="relative flex flex-col items-center gap-6">
                      <div className="scale-110 md:scale-125">
                        <ColorDisplay color={targetColor} label="Target Color" />
                      </div>
                      <div className="absolute -top-6 -right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-bounce">
                        {timeLeft}
                      </div>
                    </div>
                  )}
                </div>

                {gameState === 'MATCHING' && (
                  <div className="w-full flex flex-col items-center gap-12 pt-4">
                    <div className="scale-95 md:scale-105">
                      <ColorPicker color={userColor} onChange={setUserColor} />
                    </div>
                    <button 
                      onClick={handleMatch}
                      className="px-20 py-6 bg-white text-black rounded-full font-black text-2xl transition-all hover:scale-110 active:scale-90 shadow-2xl hover:shadow-white/20 tracking-tighter"
                    >
                      CONFIRM MATCH
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'FINAL' && (
        <div className="text-center animate-fade-in space-y-12 w-full max-w-xl">
          <div className="space-y-3">
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic uppercase">Victory!</h2>
            <p className="text-slate-500 font-medium tracking-widest text-sm uppercase">Performance summary through {ROUNDS_LIMIT} rounds.</p>
          </div>

          <div className="grid grid-cols-2 gap-6 px-4">
            <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3 relative z-10">Total Points</p>
              <p className="text-6xl md:text-7xl font-black text-white relative z-10 tracking-tighter">{totalScore}</p>
            </div>
            <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3 relative z-10">Avg. Accuracy</p>
              <p className="text-6xl md:text-7xl font-black text-blue-500 relative z-10 tracking-tighter text-glow">{avgScore}%</p>
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="w-full max-w-sm py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black text-3xl transition-all shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 mx-auto block tracking-tighter"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
