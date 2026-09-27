import KeywordUpdate from './components/KeywordUpdate';

interface Props {
  params: Promise<{ keywordId: string }>;
}

const KeywordUpdatePage = async ({ params }: Props) => {
  const { keywordId } = await params;
  return (
    <>
      <KeywordUpdate keywordId={keywordId} />
    </>
  );
};

export default KeywordUpdatePage;
