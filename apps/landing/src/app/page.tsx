import Concepts from './components/concepts/Concepts';
import Faq from './components/faq/Faq';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import IntroVideo from './components/intro-video/IntroVideo';
import KeyVisual from './components/key-visual/KeyVisual';
import StickyInstall from './components/sticky-install/StickyInstall';
import Talk from './components/talkroom/TalkRoom';

export default function Home() {
  return (
    <>
      <Header />
      <KeyVisual />
      <Concepts />
      <IntroVideo />
      <Talk />
      <Faq />
      <Footer />
      <StickyInstall />
    </>
  );
}
