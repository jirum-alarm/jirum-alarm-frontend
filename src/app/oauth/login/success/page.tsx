"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { StorageTokenKey } from "../../../../type/enum/auth";

export default function OauthLoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (accessToken) {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, refreshToken);
  }

  useEffect(() => {
    router.push("/");
    return;
  }, []);

  return "로그인 진행중...";
}
