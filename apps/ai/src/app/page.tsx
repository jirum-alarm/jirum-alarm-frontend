import Chat from '@/features/answer/ui/Chat';

export default function Page() {
  return (
    <>
      <div className="ambient" aria-hidden />
      <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        <Chat />
      </main>
    </>
  );
}
