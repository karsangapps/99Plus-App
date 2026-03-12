"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GuardianConsentSection,
  type ConsentMethod,
} from "@/components/signup/GuardianConsentSection";
import { TargetUniversitiesSelector } from "@/components/signup/TargetUniversitiesSelector";

type Language = "en" | "hi";

function computeAge(dobIso: string) {
  if (!dobIso) return null;
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export default function SignupPage() {
  const [lang, setLang] = useState<Language>("en");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [examYear, setExamYear] = useState(2026);
  const [class12Stream, setClass12Stream] = useState("Science");
  const [boardName, setBoardName] = useState("CBSE");
  const [targetUniversities, setTargetUniversities] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentMethod, setConsentMethod] = useState<ConsentMethod>("sms");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const age = useMemo(() => computeAge(dob), [dob]);
  const isMinor = typeof age === "number" && age < 18;

  const fullNameError = !fullName.trim() ? "Full name is required." : "";
  const emailError = !email.trim() ? "Email is required." : "";
  const dobError = !dob.trim() ? "Date of birth is required." : "";
  const passwordError =
    !password || password.length < 8
      ? "Password must be at least 8 characters."
      : "";
  const guardianPhoneError =
    isMinor && consentMethod === "sms" && !guardianPhone.trim()
      ? "Parent's mobile number is required."
      : "";
  const guardianEmailError =
    isMinor && consentMethod === "email" && !guardianEmail.trim()
      ? "Parent's email address is required."
      : "";
  const targetsError = !targetUniversities.length
    ? "Pick at least one target university."
    : "";
  const termsError = !termsAccepted
    ? "You must accept the Terms and Privacy Policy."
    : "";

  const canSubmit =
    !fullNameError &&
    !emailError &&
    !dobError &&
    !passwordError &&
    !targetsError &&
    !termsError &&
    (!isMinor || (!guardianPhoneError && !guardianEmailError));

  async function onSubmit() {
    setSubmitAttempted(true);
    if (!canSubmit || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          dob,
          password,
          preferredLanguage: lang,
          examYear,
          class12Stream,
          boardName,
          targetUniversities,
          termsAccepted,
          guardian: isMinor
            ? {
                method: consentMethod,
                phone: consentMethod === "sms" ? guardianPhone : null,
                email: consentMethod === "email" ? guardianEmail : null,
              }
            : null,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        next?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error || "Signup failed");
      window.location.href = json.next || "/onboarding";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center relative px-4 py-8 sm:px-8 sm:py-12 bg-[#F8FAFC]">
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-[#E5E7EB] px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
          <div className="hidden md:flex flex-col justify-between border-r border-[#E5E7EB] pr-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[10px] bg-[#6366F1] flex items-center justify-center">
                  <span className="text-white font-extrabold">99</span>
                  <span className="text-[#FACC15] font-extrabold -ml-0.5">
                    +
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xl tracking-tight text-[#0F172A]">
                    99Plus
                  </span>
                  <p className="text-[10px] font-semibold tracking-widest text-[#6366F1]">
                    SURGICAL SELECTION ENGINE
                  </p>
                </div>
              </div>
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-2">
                One account for your entire CUET journey
              </h2>
              <p className="text-sm text-[#64748B]">
                Lock eligibility, simulate the NTA interface, and track every
                mark leak — all from a single, DPDP-compliant Command Center.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto md:max-w-none space-y-6">
            <div className="flex items-center justify-center gap-2.5 md:hidden">
              <div className="w-10 h-10 rounded-[10px] bg-[#6366F1] flex items-center justify-center">
                <span className="text-white font-extrabold">99</span>
                <span className="text-[#FACC15] font-extrabold -ml-0.5">+</span>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-[#0F172A]">
                  99Plus
                </span>
                <p className="text-[10px] font-semibold tracking-widest text-[#6366F1]">
                  SURGICAL SELECTION ENGINE
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#9CA3AF]">
                  Step 1 of 3
                </span>
                <div className="w-px h-4 bg-[#E5E7EB]" />
                <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-[7px] p-[3px] gap-1">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={[
                      "px-3 py-1 rounded-[5px] text-[11px] font-semibold transition-all",
                      lang === "en"
                        ? "bg-[#6366F1] text-white"
                        : "bg-transparent text-[#9CA3AF]",
                    ].join(" ")}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("hi")}
                    className={[
                      "px-3 py-1 rounded-[5px] text-[11px] font-semibold transition-all",
                      lang === "hi"
                        ? "bg-[#6366F1] text-white"
                        : "bg-transparent text-[#9CA3AF]",
                    ].join(" ")}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-center text-[#0F172A]">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-center text-[#9CA3AF]">
                Begin your surgical prep journey. Takes under 2 minutes.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { createClient } = await import("@insforge/sdk");
                    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
                    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
                    if (!baseUrl || !anonKey) {
                      setError(
                        "Google sign-in is not configured yet. Please use email signup.",
                      );
                      return;
                    }
                    const insforge = createClient({ baseUrl, anonKey });
                    const { data, error: authError } =
                      await insforge.auth.signInWithOAuth({
                        provider: "google",
                        skipBrowserRedirect: true,
                      });
                    if (authError || !data?.url) {
                      setError(authError?.message || "Google sign-in failed.");
                      return;
                    }
                    window.location.href = data.url;
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Google sign-in is unavailable.",
                    );
                  }
                }}
                className="w-full h-11 rounded-xl border border-[#E5E7EB] bg-white text-[#0F172A] text-sm font-semibold flex items-center justify-center gap-3 hover:border-[#C7D2FE] hover:bg-[#F8FAFF] transition-colors"
              >
                Continue with Google
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs font-medium text-[#9CA3AF]">
                or sign up with email
              </span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  placeholder="e.g. Priya Sharma"
                  autoComplete="name"
                />
                {submitAttempted && fullNameError ? (
                  <p className="mt-1 text-xs text-red-600">{fullNameError}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  placeholder="priya@example.com"
                  autoComplete="email"
                  type="email"
                />
                {submitAttempted && emailError ? (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                {typeof age === "number" ? (
                  <p className="text-xs mt-1.5 text-[#9CA3AF]">
                    Age detected: <span className="font-semibold">{age}</span>{" "}
                    {age < 18 ? "(Minor — guardian verification required)" : ""}
                  </p>
                ) : null}
                {submitAttempted && dobError ? (
                  <p className="mt-1 text-xs text-red-600">{dobError}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  type="password"
                />
                {submitAttempted && passwordError ? (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                ) : null}
              </div>

              <GuardianConsentSection
                isMinor={isMinor}
                consentMethod={consentMethod}
                onConsentMethodChange={setConsentMethod}
                guardianPhone={guardianPhone}
                guardianEmail={guardianEmail}
                onGuardianPhoneChange={setGuardianPhone}
                onGuardianEmailChange={setGuardianEmail}
                submitAttempted={submitAttempted}
                guardianPhoneError={guardianPhoneError}
                guardianEmailError={guardianEmailError}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                    CUET Exam Year
                  </label>
                  <select
                    value={examYear}
                    onChange={(e) => setExamYear(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1] bg-white"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                    Class 12 Stream
                  </label>
                  <select
                    value={class12Stream}
                    onChange={(e) => setClass12Stream(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1] bg-white"
                  >
                    <option>Science</option>
                    <option>Commerce</option>
                    <option>Humanities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A]">
                  Board Name
                </label>
                <input
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#6366F1]"
                  placeholder="CBSE / ISC / State board..."
                />
              </div>

              <TargetUniversitiesSelector
                selected={targetUniversities}
                onChange={setTargetUniversities}
                submitAttempted={submitAttempted}
                error={targetsError}
              />

              <label className="flex items-start gap-2 text-xs text-[#0F172A]">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="text-[#64748B]">
                  I agree to the{" "}
                  <span className="text-[#6366F1] font-semibold underline">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-[#6366F1] font-semibold underline">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {submitAttempted && termsError ? (
                <p className="text-xs text-red-600">{termsError}</p>
              ) : null}
              {error ? <p className="text-xs text-red-600">{error}</p> : null}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={onSubmit}
                className={[
                  "w-full h-12 rounded-xl text-white text-sm font-bold transition-all",
                  !canSubmit || isSubmitting
                    ? "bg-[#6366F1]/50 cursor-not-allowed"
                    : "bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA]",
                ].join(" ")}
              >
                {isSubmitting ? "Creating…" : "Create account"}
              </button>

              <p className="text-xs text-[#9CA3AF] text-center">
                Already have an account?{" "}
                <Link
                  className="text-[#6366F1] font-semibold underline"
                  href="/"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
