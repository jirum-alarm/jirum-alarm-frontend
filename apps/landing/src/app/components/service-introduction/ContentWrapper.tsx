import Image from 'next/image';

const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex h-screen w-full snap-start items-center justify-center bg-gray-50 pt-50">
      {children}
    </section>
  );
};

const ContentImage = ({ src, alt }: { src: string; alt: string }) => {
  return <Image src={src} alt={alt} width={460} height={548} />;
};

const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="pt-30">{children}</div>;
};

const ContentKeyword = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-primary-700 pb-2 font-bold">{children}</p>;
};

const ContentTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="pb-4 text-4xl font-bold">{children}</h3>;
};

const ContentDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-lg font-medium text-gray-600">{children}</p>;
};

Content.Image = ContentImage;
Content.Wrapper = ContentWrapper;
Content.Keyword = ContentKeyword;
Content.Title = ContentTitle;
Content.Description = ContentDescription;

export default Content;
