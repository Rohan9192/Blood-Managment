"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations";
import Link from "next/link";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Droplets, HeartPulse, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"DONOR" | "RECEIVER">("DONOR");

  const [step, setStep] = useState<"email_input" | "otp_verify" | "details_input">("email_input");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "DONOR" },
  });

  const onSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to send OTP");
      } else {
        toast.success("OTP sent to your email!");
        setValue("email", email);
        setStep("otp_verify");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Verification failed");
      } else {
        toast.success("Email verified! Complete your profile.");
        setStep("details_input");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitFinal = async (data: RegisterInput) => {
    setIsSubmitting(true);
    try {
      // Force the verified email into the submission data
      data.email = email;
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Registration failed");
      } else {
        toast.success("Account created successfully!");
        router.push("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-rose-500/10 rounded-br-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === "email_input" && "Start Registration"}
            {step === "otp_verify" && "Verify Your Email"}
            {step === "details_input" && "Complete Profile"}
          </h1>
          <p className="text-slate-400">
            {step === "email_input" && "Enter your email securely."}
            {step === "otp_verify" && `We sent a 6-digit code to ${email}`}
            {step === "details_input" && "Secure your account with a password."}
          </p>
        </div>

        {step === "email_input" && (
          <form onSubmit={onSendOtp} className="space-y-5 relative z-10">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-4" size="lg" loading={isSubmitting}>
              Send Verification Code
            </Button>
            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-400 font-medium hover:text-rose-300">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === "otp_verify" && (
          <form onSubmit={onVerifyOtp} className="space-y-5 relative z-10">
            <Input
              label="One-Time Password (OTP)"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <Button type="submit" className="w-full mt-4" size="lg" loading={isSubmitting}>
              Verify Email
            </Button>
            <button
              type="button"
              className="w-full text-slate-400 text-sm hover:text-white transition-colors"
              onClick={() => setStep("email_input")}
            >
              Back
            </button>
          </form>
        )}

        {step === "details_input" && (
          <>
            <div className="flex justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("DONOR");
                  setValue("role", "DONOR");
                }}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === "DONOR"
                    ? "border-rose-500 bg-rose-500/10 text-rose-400"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <HeartPulse className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold text-sm">I want to Donate</div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("RECEIVER");
                  setValue("role", "RECEIVER");
                }}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === "RECEIVER"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <User className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold text-sm">I need Blood</div>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitFinal)} className="space-y-5 relative z-10">
              <input type="hidden" value={email} {...register("email")} />
              
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button type="submit" className="w-full mt-4" size="lg" loading={isSubmitting}>
                Create Account
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
