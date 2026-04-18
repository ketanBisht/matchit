import { GameContainer } from './components/GameContainer';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <GameContainer />
      
      <footer className="absolute bottom-8 text-slate-500 text-sm font-medium tracking-widest uppercase">
        Match the color. Master your vision.
      </footer>
    </main>
  );
}
