import Header from './components/header/Header';
import KeyVisual from './components/key-visual/KeyVisual';

export default function Home() {
  return (
    <>
      <Header />
      <div className="h-screen overflow-y-auto scroll-smooth">
        <KeyVisual />
        <KeyVisual />
      </div>
    </>
  );
}
