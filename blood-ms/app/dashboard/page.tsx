"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/ui/Spinner";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else if (session.user.role === "ADMIN") {
      router.push("/admin");
    } else if (session.user.role === "DONOR") {
      router.push("/profile");
    } else {
      router.push("/requests"); // Receiver goes to requests
    }
  }, [session, status, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
