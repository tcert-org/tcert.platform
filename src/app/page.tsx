"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      router.replace(`/dashboard/`);
    }

    redirectUser();
  }, [router]);

  return null;
}
