import "./globals.css";

import { ApolloWrapper } from "../lib/apollo-wrapper";

export const metadata = {
  title: "지름알림: 핫딜 정보 모아보기",
  description: "지름 정보를 알려드려요!",
  openGraph: {
    title: "지름알림: 핫딜 정보 모아보기",
    author: "지름알림",
    description: "핫딜 정보를 알려드려요!",
    images: "./opengraph-image.png",
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
