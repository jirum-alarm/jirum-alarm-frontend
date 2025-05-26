import Header from './components/header/Header';
import KeyVisual from './components/key-visual/KeyVisual';
import PainPoint from './components/pain-point/PainPoint';

export default function Home() {
  return (
    <div className="relative h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth">
      <Header />
      <KeyVisual />
      <PainPoint />
    </div>
  );
}
