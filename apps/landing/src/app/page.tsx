import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import KeyVisual from './components/key-visual/KeyVisual';
import PainPoint from './components/pain-point/PainPoint';
import ServiceIntroduction from './components/service-introduction/ServiceIntroduction';
import Talk from './components/talkroom/TalkRoom';

export default function Home() {
  return (
    <>
      <Header />
      <KeyVisual />
      <PainPoint />
      <ServiceIntroduction />
      <Talk />
      <Footer />
    </>
  );
}
