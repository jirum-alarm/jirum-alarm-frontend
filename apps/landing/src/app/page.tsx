import Header from './components/header/Header';
import KeyVisual from './components/key-visual/KeyVisual';
import PainPoint from './components/pain-point/PainPoint';
import ServiceIntroduction from './components/service-introduction/ServiceIntroduction';

export default function Home() {
  return (
    <div className="relative h-screen snap-y snap-proximity overflow-y-auto">
      <Header />
      <KeyVisual />
      <PainPoint />
      <ServiceIntroduction />
    </div>
  );
}
