import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OauthLoginSuccess() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/`);
  }, []);

  return <>login success</>;
}
