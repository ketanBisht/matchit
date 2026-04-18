import { GameContainer } from './components/GameContainer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs for aesthetics */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <GameContainer />
      </main>
      
      <footer className="w-full py-8 text-center text-slate-600 text-[10px] font-black tracking-[0.5em] uppercase relative z-10">
        Match the color. Master your vision.
      </footer>
    </div>
  );
}
