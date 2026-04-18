'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Color, getRandomColor, calculateScore, colorToRgb, getMatchPercentage } from '../lib/game-logic';
import { ColorDisplay } from './ColorDisplay';
import { ColorPicker } from './ColorPicker';
import { Starburst, BigSpark } from './DoodleElements';

type GameState = 'START' | 'SHOWING' | 'MATCHING' | 'RESULT' | 'FINAL';
type Theme = 'light' | 'dark';

const TOTAL_ROUNDS = 5;
const SHOW_MS = 3000;

// ─── Animation Variants ───────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.3, ease: 'easeIn' } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } },
};

// ─── Letter animation for the hero title ───────────────
const letterVariant = {
  hidden: { opacity: 0, y: 40 },
  show:   (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16,1,0.3,1], delay: i * 0.06 },
  }),
};

export const GameContainer: React.FC = () => {
  const [state,  setState]  = useState<GameState>('START');
  const [round,  setRound]  = useState(1);
  const [target, setTarget] = useState<Color>({ r:0, g:0, b:0 });
  const [guess,  setGuess]  = useState<Color>({ r:127, g:127, b:127 });
  const [scores, setScores] = useState<number[]>([]);
  const [timer,  setTimer]  = useState(SHOW_MS / 1000);
  const [rules,  setRules]  = useState(false);
  const [theme,  setTheme]  = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const newRound = useCallback(() => {
    setTarget(getRandomColor());
    setGuess({ r:127, g:127, b:127 });
    setState('SHOWING');
    setTimer(SHOW_MS / 1000);
  }, []);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (state === 'SHOWING' && timer > 0)  t = setTimeout(() => setTimer(p=>p-1), 1000);
    if (state === 'SHOWING' && timer === 0) setState('MATCHING');
    return () => clearTimeout(t);
  }, [state, timer]);

  const submit = () => { setScores(p=>[...p, calculateScore(target, guess)]); setState('RESULT'); };
  const next   = () => { if (round < TOTAL_ROUNDS) { setRound(p=>p+1); newRound(); } else setState('FINAL'); };
  const reset  = () => { setRound(1); setScores([]); setState('START'); };

  const total = scores.reduce((a,b)=>a+b, 0);
  const avg   = scores.length ? Math.round(total/scores.length) : 0;
  const match = getMatchPercentage(target, guess);

  return (
    <div className="flex flex-col min-h-screen" style={{ background:'var(--bg)' }}>

      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', backdropFilter:'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-black text-lg tracking-tight">matchIT.</span>
          <span className="tag">Color Memory</span>
        </div>
        <button className="btn btn-ghost text-xs px-4 py-2" onClick={() => setTheme(p=>p==='light'?'dark':'light')}>
          {theme==='light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </motion.header>

      {/* ── Content ── */}
      <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
        <AnimatePresence mode="wait">

          {/* ════════ START ════════ */}
          {state === 'START' && (
            <motion.div key="start" variants={stagger} initial="hidden" animate="show" exit="exit"
              className="flex flex-col items-center text-center gap-10 max-w-lg w-full">
              {!rules ? (
                <>
                  {/* Floating accent sparks */}
                  <motion.div className="absolute pointer-events-none select-none"
                    style={{ top:'18%', left:'15%' }}
                    animate={{ rotate:[0,15,0,-15,0], scale:[1,1.15,1] }}
                    transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}>
                    <BigSpark className="w-8 h-8" style={{ color:'var(--accent)', opacity:0.35 } as React.CSSProperties} />
                  </motion.div>
                  <motion.div className="absolute pointer-events-none select-none"
                    style={{ top:'22%', right:'16%' }}
                    animate={{ rotate:[0,-12,0,12,0], scale:[1,1.2,1] }}
                    transition={{ duration:5, repeat:Infinity, ease:'easeInOut', delay:0.8 }}>
                    <Starburst className="w-6 h-6" style={{ color:'var(--accent)', opacity:0.3 } as React.CSSProperties} />
                  </motion.div>
                  <motion.div className="absolute pointer-events-none select-none"
                    style={{ bottom:'20%', left:'18%' }}
                    animate={{ rotate:[0,20,0], scale:[1,1.1,1] }}
                    transition={{ duration:7, repeat:Infinity, ease:'easeInOut', delay:1.5 }}>
                    <Starburst className="w-5 h-5" style={{ color:'var(--fg)', opacity:0.12 } as React.CSSProperties} />
                  </motion.div>

                  {/* Hero title — letter-by-letter */}
                  <div className="overflow-hidden">
                    <div className="flex items-end justify-center" style={{ fontSize:'clamp(5.5rem,14vw,9rem)' }}>
                      {'match'.split('').map((l,i)=>(
                        <motion.span key={i} custom={i} variants={letterVariant}
                          className="font-black tracking-[-0.04em] leading-none" style={{ color:'var(--fg)' }}>
                          {l}
                        </motion.span>
                      ))}
                      <motion.span custom={5} variants={letterVariant}
                        className="font-black leading-none"
                        style={{ color:'var(--accent)', marginLeft:2 }}>
                        .
                      </motion.span>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <motion.p variants={fadeUp}
                    className="text-base font-medium leading-relaxed max-w-xs"
                    style={{ color:'var(--fg2)' }}>
                    Memorize a color in 3 seconds,<br/>then recreate it from memory.
                  </motion.p>

                  {/* Animated color swatches preview */}
                  <motion.div variants={fadeUp} className="flex items-center gap-3">
                    {['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899'].map((c,i)=>(
                      <motion.div key={c}
                        animate={{ y: [0, i%2===0?-6:6, 0] }}
                        transition={{ duration:2.5+i*0.3, repeat:Infinity, ease:'easeInOut', delay:i*0.15 }}
                        style={{
                          width: 28, height: 28, borderRadius:'50%', backgroundColor: c,
                          boxShadow:`0 4px 12px ${c}60`,
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* CTA */}
                  <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 w-full">
                    <motion.button onClick={newRound} className="btn btn-primary w-full max-w-xs py-4 text-base font-semibold"
                      whileHover={{ scale:1.03, y:-2 }} whileTap={{ scale:0.97 }}
                      transition={{ type:'spring', stiffness:400, damping:20 }}>
                      Start Game
                    </motion.button>
                    <motion.button onClick={()=>setRules(true)} className="btn btn-ghost text-sm px-6 py-2.5 font-medium"
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                      Read the rules
                    </motion.button>
                  </motion.div>
                </>
              ) : (
                /* Rules */
                <motion.div key="rules" variants={scaleIn} initial="hidden" animate="show" exit="exit"
                  className="card w-full p-8 text-left">
                  <h2 className="font-black text-2xl tracking-tight mb-6">How to Play</h2>
                  <ol className="space-y-5 mb-8">
                    {[
                      'A random color appears on screen for exactly 3 seconds.',
                      'After it disappears, use the color wheel and brightness slider to recreate it from memory.',
                      'Hit "Confirm" — your score (0–100) is based on how close your colors are.',
                      'Play 5 rounds. Total and average accuracy shown at the end.',
                    ].map((r,i)=>(
                      <motion.li key={i} custom={i} variants={letterVariant} className="flex gap-4">
                        <span className="font-mono font-black text-lg leading-none shrink-0" style={{ color:'var(--accent)' }}>0{i+1}</span>
                        <p className="text-sm font-medium leading-relaxed" style={{ color:'var(--fg2)' }}>{r}</p>
                      </motion.li>
                    ))}
                  </ol>
                  <motion.button onClick={()=>setRules(false)} className="btn btn-primary w-full py-3.5 font-semibold"
                    whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                    Got it
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ════════ IN-GAME ════════ */}
          {(state==='SHOWING'||state==='MATCHING'||state==='RESULT') && (
            <motion.div key="game" variants={stagger} initial="hidden" animate="show" exit="exit"
              className="flex flex-col items-center gap-10 w-full max-w-xl">

              {/* Round / score bar */}
              <motion.div variants={fadeUp}
                className="card flex items-center gap-6 px-7 py-4 self-stretch" style={{ borderRadius:100 }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:'var(--fg3)' }}>Round</p>
                  <p className="font-mono font-black text-2xl leading-none">
                    {round}<span className="font-normal text-base opacity-30"> / {TOTAL_ROUNDS}</span>
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <motion.div animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}>
                    <Starburst className="w-5 h-5" style={{ color:'var(--accent)', opacity:0.5 } as React.CSSProperties} />
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:'var(--fg3)' }}>Score</p>
                  <p className="font-mono font-black text-2xl leading-none" style={{ color:'var(--accent)' }}>{total}</p>
                </div>
              </motion.div>

              {/* SHOWING */}
              {state==='SHOWING' && (
                <motion.div variants={fadeUp} className="flex flex-col items-center gap-8">
                  <p className="text-sm font-medium" style={{ color:'var(--fg2)' }}>Study this color carefully…</p>
                  <motion.div className="relative" animate={{ scale:[1,1.02,1] }} transition={{ duration:2, repeat:Infinity }}>
                    <ColorDisplay color={target} label="" />
                    <motion.div
                      key={timer}
                      initial={{ scale:1.4, opacity:0 }} animate={{ scale:1, opacity:1 }}
                      className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center font-mono font-black text-xl"
                      style={{ background:'var(--fg)', color:'var(--bg)', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
                      {timer}
                    </motion.div>
                  </motion.div>
                  <p className="text-xs font-medium" style={{ color:'var(--fg3)' }}>Disappears when the counter hits 0</p>
                </motion.div>
              )}

              {/* MATCHING */}
              {state==='MATCHING' && (
                <motion.div variants={stagger} initial="hidden" animate="show"
                  className="flex flex-col items-center gap-8 w-full">
                  <motion.p variants={fadeUp} className="text-sm font-medium" style={{ color:'var(--fg2)' }}>
                    Now recreate it from memory…
                  </motion.p>
                  <motion.div variants={scaleIn}>
                    <ColorPicker color={guess} onChange={setGuess} />
                  </motion.div>
                  <motion.button variants={fadeUp} onClick={submit}
                    className="btn btn-accent px-12 py-4 text-base font-semibold w-full max-w-xs"
                    whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.96 }}>
                    Confirm Match
                  </motion.button>
                </motion.div>
              )}

              {/* RESULT */}
              {state==='RESULT' && (
                <motion.div variants={stagger} initial="hidden" animate="show"
                  className="flex flex-col items-center gap-10 w-full">
                  <motion.div variants={fadeUp}
                    className="card w-full p-8 flex flex-col md:flex-row items-center gap-8 justify-center">
                    <ColorDisplay color={target} label="Target" showDetails />
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ scale:0 }} animate={{ scale:1 }}
                        transition={{ type:'spring', stiffness:300, damping:18, delay:0.3 }}
                        className="px-6 py-4 rounded-2xl text-center"
                        style={{ background:'var(--accent-bg)', border:'1px solid var(--accent)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color:'var(--accent)' }}>Match</p>
                        <p className="font-mono font-black text-4xl" style={{ color:'var(--accent)' }}>{match}%</p>
                      </motion.div>
                    </div>
                    <ColorDisplay color={guess} label="Yours" showDetails />
                  </motion.div>

                  <motion.div variants={scaleIn} className="card w-full max-w-xs p-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--fg3)' }}>Round Score</p>
                    <motion.p
                      initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
                      transition={{ type:'spring', stiffness:300, damping:18, delay:0.2 }}
                      className="font-mono font-black leading-none mb-6" style={{ fontSize:'5rem', color:'var(--fg)' }}>
                      {scores[scores.length-1]}
                    </motion.p>
                    <motion.button onClick={next} className="btn btn-primary w-full py-3.5 font-semibold"
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                      {round===TOTAL_ROUNDS ? 'See Results' : 'Next Round →'}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ════════ FINAL ════════ */}
          {state==='FINAL' && (
            <motion.div key="final" variants={stagger} initial="hidden" animate="show" exit="exit"
              className="flex flex-col items-center gap-10 w-full max-w-xl text-center">
              <motion.div variants={fadeUp} className="relative">
                <motion.div
                  animate={{ rotate:[0,10,-10,0], scale:[1,1.1,1] }}
                  transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
                  className="absolute -top-8 -right-8 pointer-events-none">
                  <BigSpark className="w-12 h-12" style={{ color:'var(--accent)', opacity:0.5 } as React.CSSProperties} />
                </motion.div>
                <span className="tag mb-4 inline-flex">Game complete</span>
                <h2 className="font-black tracking-[-0.04em] leading-none"
                  style={{ fontSize:'clamp(3rem,8vw,5rem)', color:'var(--fg)' }}>
                  Exhibition.
                </h2>
                <p className="text-sm mt-2" style={{ color:'var(--fg2)' }}>{TOTAL_ROUNDS} rounds played</p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 w-full">
                <div className="card p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--fg3)' }}>Total</p>
                  <motion.p className="font-mono font-black text-5xl" style={{ color:'var(--fg)' }}
                    initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }}
                    transition={{ type:'spring', stiffness:300, delay:0.3 }}>
                    {total}
                  </motion.p>
                </div>
                <motion.div className="card p-6 text-center" style={{ background:'var(--accent)', border:'none' }}
                  initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }}
                  transition={{ type:'spring', stiffness:300, delay:0.45 }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">Avg</p>
                  <p className="font-mono font-black text-5xl text-white">{avg}%</p>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeUp} className="card w-full p-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-4 text-left" style={{ color:'var(--fg3)' }}>Round History</p>
                <div className="flex gap-3">
                  {scores.map((s,i)=>(
                    <motion.div key={i} className="flex flex-col items-center gap-1.5 flex-1"
                      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: 0.1 * i, type:'spring', stiffness:300 }}>
                      <div className="w-full aspect-square rounded-xl flex items-center justify-center font-mono font-black text-xl"
                        style={{ background:'var(--bg)', color:'var(--fg)' }}>
                        {s}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color:'var(--fg3)' }}>R{i+1}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.button variants={fadeUp} onClick={reset}
                className="btn btn-primary w-full max-w-xs py-4 font-semibold"
                whileHover={{ scale:1.03, y:-2 }} whileTap={{ scale:0.97 }}>
                Play Again
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};
