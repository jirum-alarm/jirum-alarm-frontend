import "./globals.css";

import { Metadata } from "next";
import { GA_TRACKING_ID } from "../common/constant";
import NavBar from "../components/Navbar";
import { ApolloWrapper } from "../lib/apollo-wrapper";
import GoogleAnalytics from "./GoogleAnalitics";

export const metadata: Metadata = {
  title: "지름알림: 핫딜 정보 모아보기",
  description: "지름 정보를 알려드려요!",
  openGraph: {
    title: "지름알림: 핫딜 정보 모아보기",
    description: "핫딜 정보를 알려드려요!",
    images: "./opengraph-image.png",
  },
  icons: {
    icon: "/icon.png",
  },
  viewport:
    "initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
      <body>
        <div className="font-mono max-w-screen-lg mx-auto">
          <NavBar></NavBar>
          <ApolloWrapper>{children}</ApolloWrapper>
        </div>
      </body>
    </html>
  );
}
