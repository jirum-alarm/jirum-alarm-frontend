import CommentContainerServer from './components/CommentContainerServer';

export default function CommentPage({ params }: { params: { id: string } }) {
  return <CommentContainerServer productId={+params.id} />;
}
