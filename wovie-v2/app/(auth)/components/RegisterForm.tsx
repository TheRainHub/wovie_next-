"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AtSign, Mail, Lock, UserPlus } from "lucide-react";
import { safeReturnPath } from "@/app/lib/login";

import AuthInput from "./AuthInput";
import PasswordStrength from "./PasswordStrength";
import CloseButton from "./CloseButton";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface Props {
  onSwitch: () => void;
  onClose?: () => void;
  /** Where to go after the account is created (a same-site path). */
  callbackUrl?: string | null;
}

export default function RegisterForm({ onSwitch, onClose, callbackUrl }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // The same rules as the server (app/api/auth/register/route.ts).
  const usernameValid = useMemo(() => form.username.trim().length >= 3 && form.username.trim().length <= 20, [form.username]);
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), [form.email]);
  const passwordValid = useMemo(() => form.password.length >= 8, [form.password]);
  const confirmValid = useMemo(
    () => form.confirmPassword.length > 0 && form.confirmPassword === form.password,
    [form.confirmPassword, form.password]
  );
  const confirmError =
    form.confirmPassword.length > 0 && form.confirmPassword !== form.password ? "Passwords don't match" : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Registration failed. Try again.");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (!loginResult?.ok) {
        // The account exists; only the automatic sign-in failed.
        setError("Your account is ready, but signing in failed. Use Sign in below.");
        return;
      }
      router.push(safeReturnPath(callbackUrl));
      router.refresh();
    } catch {
      setError("Could not reach Wovie. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[480px] p-7 sm:p-9 rounded-2xl border bg-[#162938]/95 backdrop-blur-xl auth-scroll max-h-[95vh] overflow-y-auto
                    transition-all duration-1000 ease-out
                    border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.15),0_8px_40px_rgba(0,0,0,0.5)]
                    has-[[data-saber-ignited=true]]:border-cyan-400/60
                    has-[[data-saber-ignited=true]]:shadow-[0_0_120px_rgba(34,211,238,0.4),0_8px_40px_rgba(0,0,0,0.5)]">
      <CloseButton onClose={onClose || (() => router.push("/"))} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="space-y-5"
      >
        <motion.div variants={fadeUp} className="space-y-1 pt-1 text-center">
          <h2 className="text-3xl font-logo text-white">Create an account</h2>
          <p className="text-sm text-white/50">To rate films and keep favourites and lists.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={fadeUp}>
            <AuthInput
              label="Username"
              icon={<AtSign size={16} />}
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="username"
              placeholder="3 to 20 characters"
              autoFocus
              isValid={usernameValid}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <AuthInput
              label="Email"
              icon={<Mail size={16} />}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="your@email.com"
              isValid={emailValid}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthInput
              label="Password"
              icon={<Lock size={16} />}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              isValid={passwordValid}
            />
            <AuthInput
              label="Confirm"
              icon={<Lock size={16} />}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
              isValid={confirmValid}
              error={confirmError}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <PasswordStrength password={form.password} />
          </motion.div>

          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2 px-3"
            >
              {error}
            </motion.p>
          )}

          <motion.div variants={fadeUp}>
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full h-12 rounded-xl font-semibold text-white
                flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Creating your account" />
              ) : (
                <>
                  <UserPlus size={18} aria-hidden />
                  Create account
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.p
          variants={fadeUp}
          className="text-white/40 text-sm text-center pb-1"
        >
          Already have an account?{" "}
          <button
            onClick={onSwitch}
            type="button"
            className="text-[#D4537E] font-semibold hover:text-[#e06b93] transition-colors"
          >
            Sign in
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
