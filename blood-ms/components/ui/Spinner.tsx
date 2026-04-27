import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Spinner({ className, size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <Loader2 className={cn("animate-spin text-rose-500", sizeClasses[size], className)} />
  );
}
