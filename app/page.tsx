import { GameContainer } from './components/GameContainer';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <GameContainer />
    </main>
  );
}
