"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { safeReturnPath } from "@/app/lib/login";

import AuthInput from "./AuthInput";
import CloseButton from "./CloseButton";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface Props {
  onSwitch: () => void;
  onClose?: () => void;
  /** Where to go after signing in (a same-site path). */
  callbackUrl?: string | null;
}

export default function LoginForm({ onSwitch, onClose, callbackUrl }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = useMemo(() => password.length >= 8, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (!result?.ok || result.error) {
      setLoading(false);
      setError(
        result?.error === "CredentialsSignin" || result?.error?.includes("Invalid")
          ? "Invalid email or password"
          : "Could not sign you in. Try again in a moment."
      );
      return;
    }
    router.push(safeReturnPath(callbackUrl));
    router.refresh();
  };

  return (
    <div className="relative w-full max-w-[480px] p-7 sm:p-9 rounded-2xl border bg-[#162938]/95 backdrop-blur-xl
                    transition-all duration-1000 ease-out
                    border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.15),0_8px_40px_rgba(0,0,0,0.5)]
                    has-[[data-saber-ignited=true]]:border-cyan-400/60
                    has-[[data-saber-ignited=true]]:shadow-[0_0_120px_rgba(34,211,238,0.4),0_8px_40px_rgba(0,0,0,0.5)]">
      <CloseButton onClose={onClose || (() => router.push("/"))} />

      <motion.div variants={stagger} initial="hidden" animate="show" exit="hidden" className="space-y-6">
        <motion.h2 variants={fadeUp} className="text-3xl font-logo text-center text-white pt-1">
          Sign in
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={fadeUp}>
            <AuthInput label="Email" icon={<Mail size={16} />} type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} autoComplete="email" placeholder="your@email.com" autoFocus isValid={emailValid} />
          </motion.div>

          <motion.div variants={fadeUp}>
            <AuthInput label="Password" icon={<Lock size={16} />} type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={8} autoComplete="current-password" placeholder="Minimum 8 characters" isValid={passwordValid} />
          </motion.div>

          {error && (
            <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2 px-3">
              {error}
            </motion.p>
          )}

          <motion.div variants={fadeUp}>
            <button type="submit" disabled={loading} className="btn-gradient w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm tracking-wide">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Signing in" /> : <><LogIn size={18} aria-hidden />Sign in</>}
            </button>
          </motion.div>
        </form>

        <motion.p variants={fadeUp} className="text-white/40 text-sm text-center">
          Don&apos;t have an account?{" "}
          <button onClick={onSwitch} type="button" className="text-[#D4537E] font-semibold hover:text-[#e06b93] transition-colors">
            Create one
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
