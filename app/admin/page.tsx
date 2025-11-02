"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/loading";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/admin");
      } else {
        router.push("/admin/dashboard");
      }
    };
    checkAuth();
  }, [router, supabase]);

  return <Loading />;
}
