import CommentContainerServer from './components/CommentContainerServer';

export default async function CommentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommentContainerServer productId={+id} />;
}
