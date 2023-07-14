"use client";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useEffect } from "react";

import { StorageTokenKey } from "../../../../enum";
import { IUser } from "../../../../graphql/interface";
import { QueryMe } from "../../../../graphql/user";

export default function Page({
  searchParams,
}: {
  searchParams: { accessToken: string; refreshToken: string };
}) {
  const accessToken = searchParams.accessToken;
  const refreshToken = searchParams.refreshToken;
  const { data } = useSuspenseQuery<IUser>(QueryMe, {
    context: {
      headers: { authorization: `Bearer ${accessToken}` },
      fetchPolicy: "no-cache",
    },
  });

  useEffect(() => {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, accessToken);
    localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, refreshToken);
    localStorage.setItem("me", JSON.stringify(data));
    window.location.replace("/");
  }, []);

  return <h1>소셜 로그인 처리중입니다...</h1>;
}
