"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OauthLoginSuccess() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
    return;
  }, []);

  return "Loading...";
}
