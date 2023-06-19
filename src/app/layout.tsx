import "./globals.css";

import { ApolloWrapper } from "../lib/apollo-wrapper";

export const metadata = {
  title: "지름알림🔔",
  description: "지름 정보를 알려드려요!",
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
