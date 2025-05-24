import Navigation from './Navigation';
import Title from './Title';

const Header = () => {
  return (
    <div className="fixed inset-0 bottom-auto z-10 bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 lg:py-3">
        <Title />
        <Navigation />
      </header>
    </div>
  );
};

export default Header;
