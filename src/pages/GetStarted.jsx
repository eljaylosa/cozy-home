import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  House,
  Leaf,
  LoaderCircle,
  Mail,
  Sparkles,
} from "lucide-react";

import cherryBlossom from "../assets/images/nature/01_cherry_blossom_tree_32x32.png";
import bambooGrove from "../assets/images/nature/04_bamboo_grove_32x32.png";
import stonePath from "../assets/images/nature/07_mossy_stone_path_32x32.png";
import toriiGate from "../assets/images/props/01_torii_gate_32x32.png";
import paperLantern from "../assets/images/props/06_paper_lantern_32x32.png";

import { API_URL, useAuth } from "../context/AuthContext";

export default function GetStarted() {
  const navigate = useNavigate();
  const { setSession, isAuthenticated, loading: authLoading } = useAuth();

  const [mode, setMode] = useState("signup");
  const [step, setStep] = useState("form");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signinEmail, setSigninEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [resendSeconds, setResendSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("error");

  const isSignup = mode === "signup";

  useEffect(() => {
    if (!resendSeconds) return;

    const timer = window.setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  function showMessage(message, type = "error") {
    setStatus(message);
    setStatusType(type);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep("form");
    setStatus("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function requestApi(endpoint, body) {
    const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || "Something went wrong.");
      error.data = data;
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async function handleSignup(event) {
    event.preventDefault();
    setStatus("");

    const cleanUsername = username.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
      showMessage(
        "Username must be 3–24 characters and may only contain letters, numbers, and underscores."
      );
      return;
    }

    if (password.length < 8) {
      showMessage("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Your passwords don't match. Please try again.");
      return;
    }

    setBusy(true);

    try {
      const data = await requestApi("signup", {
        username: cleanUsername,
        email: cleanEmail,
        password,
      });

      setSignupEmail(data.email || cleanEmail);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      setResendSeconds(data.resendAfterSeconds || 60);
      setPassword("");
      setConfirmPassword("");

      showMessage(
        "Your verification code has been sent. Check your inbox!",
        "success"
      );

      window.setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      showMessage(error.message);

      if (error.data?.canResend) {
        setStep("otp");
        setResendSeconds(0);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();

    const code = otp.join("");

    if (!/^\d{6}$/.test(code)) {
      showMessage("Please enter all six digits of your verification code.");
      return;
    }

    setBusy(true);
    setStatus("");

    try {
      const data = await requestApi("verify-email", {
        email: signupEmail.trim().toLowerCase(),
        code,
      });

      if (!data.accessToken || !data.user) {
        throw new Error(
          data.message ||
            "Email verified, but automatic sign-in was unsuccessful."
        );
      }

      setSession(data);
      showMessage("Email verified! Welcome to Cozy Home.", "success");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      showMessage(error.message);

      if (error.data?.attemptsLeft === 0) {
        showMessage(
          "You've used all verification attempts. Request a new code."
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (busy || resendSeconds > 0) return;

    setBusy(true);
    setStatus("");

    try {
      const data = await requestApi("resend-verification", {
        email: signupEmail.trim().toLowerCase(),
      });

      setOtp(["", "", "", "", "", ""]);
      setResendSeconds(data.resendAfterSeconds || 60);

      showMessage(data.message || "A new code has been sent.", "success");
      otpRefs.current[0]?.focus();
    } catch (error) {
      setResendSeconds(error.data?.retryAfterSeconds || 0);
      showMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignin(event) {
    event.preventDefault();
    setStatus("");
    setBusy(true);

    try {
      const data = await requestApi("login", {
        email: signinEmail.trim().toLowerCase(),
        password,
      });

      if (!data.accessToken || !data.user) {
        throw new Error("The server did not return a valid login session.");
      }

      setSession(data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.data?.requiresVerification) {
        setSignupEmail(error.data.email || signinEmail.trim().toLowerCase());
        setOtp(["", "", "", "", "", ""]);
        setStep("otp");
        setMode("signup");
        setResendSeconds(0);
        showMessage("Please verify your email address to continue.");
      } else {
        showMessage(error.message);
      }
    } finally {
      setBusy(false);
    }
  }

  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event) {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    event.preventDefault();

    const digits = pasted.split("");
    setOtp((current) => current.map((_, index) => digits[index] || ""));

    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  const inputClass =
    "w-full rounded-xl border border-cozy-brown/15 bg-white/80 px-4 py-3.5 text-sm text-cozy-dark outline-none transition-all placeholder:text-cozy-brown/40 focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/15";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wider text-cozy-brown/75";

  const buttonClass =
    "group flex w-full items-center justify-center gap-3 rounded-xl bg-cozy-sage-dark px-6 py-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-cozy-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cozy-cream px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cozy-sage/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-cozy-rose/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-sage-dark text-white shadow-md">
            <House size={21} />
          </div>

          <span className="font-serif text-2xl font-bold tracking-tight text-cozy-dark">
            cozy<span className="text-cozy-rose">home</span>
          </span>
        </div>

        <div className="grid overflow-hidden rounded-[2rem] border border-cozy-brown/10 bg-cozy-paper shadow-[0_25px_80px_rgba(57,68,55,0.12)] lg:min-h-[690px] lg:grid-cols-2">
          {/* Welcome panel */}
          <section className="relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-[#e5ebdc] p-7 sm:p-10 lg:min-h-full lg:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-cozy-sage-dark/10" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-cozy-sage-dark/10" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-cozy-sage-dark/15 bg-white/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                <Sparkles size={13} />
                Your cozy adventure
              </span>

              <h1 className="mt-7 max-w-md font-serif text-4xl font-medium leading-tight text-cozy-dark sm:text-5xl lg:text-[3.4rem]">
                {step === "otp" ? (
                  <>
                    One little step
                    <br />
                    <span className="italic text-cozy-rose">
                      to your new home.
                    </span>
                  </>
                ) : isSignup ? (
                  <>
                    Your own little
                    <br />
                    <span className="italic text-cozy-rose">world awaits.</span>
                  </>
                ) : (
                  <>
                    Welcome back
                    <br />
                    <span className="italic text-cozy-rose">to your home.</span>
                  </>
                )}
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-cozy-brown/80 sm:text-base">
                {step === "otp"
                  ? "Check your inbox. We sent you a little code to make sure it's really you."
                  : isSignup
                  ? "Create your own cozy space, decorate it your way, and invite your favorite people to visit."
                  : "Your little corner is waiting for you. Come back, relax, and spend some time with your friends."}
              </p>
            </div>

            {/* Pixel art scene */}
            <div className="relative mx-auto mt-8 w-full max-w-md lg:mt-10">
              <div className="relative aspect-[1.55] overflow-hidden rounded-2xl border-[6px] border-white/80 bg-[#c8deda] shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-[#b8d9df] via-[#dce8d5] to-[#c0d2a8]" />
                <div className="absolute right-[15%] top-[10%] h-12 w-12 rounded-full bg-[#f7d99b] shadow-[0_0_30px_rgba(247,217,155,0.6)] sm:h-16 sm:w-16" />
                <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[#9bb58c]" />
                <div className="absolute inset-x-0 bottom-0 h-[32%] bg-[#adc696]" />

                <img
                  src={cherryBlossom}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="absolute left-[1%] top-[12%] z-10 w-[28%] max-w-none [image-rendering:pixelated]"
                />
                <img
                  src={bambooGrove}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="absolute right-[4%] top-[16%] z-10 w-[22%] max-w-none [image-rendering:pixelated]"
                />
                <img
                  src={toriiGate}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="absolute left-1/2 top-[28%] z-20 w-[34%] max-w-none -translate-x-1/2 [image-rendering:pixelated]"
                />
                <img
                  src={stonePath}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="absolute bottom-[5%] left-[32%] z-20 w-[38%] max-w-none [image-rendering:pixelated]"
                />
                <img
                  src={paperLantern}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className="absolute bottom-[19%] right-[20%] z-20 w-[12%] max-w-none [image-rendering:pixelated]"
                />

                <div className="absolute bottom-3 left-3 z-30 rounded-full bg-cozy-paper/90 px-3 py-2 text-[9px] font-bold tracking-wider text-cozy-dark shadow-md">
                  A LITTLE PLACE TO BELONG
                </div>
              </div>

              <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-cozy-sage-dark shadow-lg sm:-left-5">
                <Heart size={15} fill="currentColor" />
                Made for friendship
              </div>

              <div className="absolute -right-2 -top-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-cozy-rose shadow-lg sm:-right-5">
                <Leaf size={15} />
                Take it slow
              </div>
            </div>

            <div className="relative z-10 mt-10 hidden items-center justify-between border-t border-cozy-sage-dark/15 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-cozy-sage-dark/70 lg:flex">
              <span>Your space. Your people.</span>
              <span>♡ Cozy Home</span>
            </div>
          </section>

          {/* Authentication panel */}
          <section className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-16">
            {step === "form" ? (
              <>
                <div className="mb-10 rounded-full bg-cozy-cream p-1.5">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className={`rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 ${
                        isSignup
                          ? "bg-cozy-sage-dark text-white shadow-md"
                          : "text-cozy-brown/65 hover:text-cozy-dark"
                      }`}
                    >
                      Create Account
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className={`rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 ${
                        !isSignup
                          ? "bg-cozy-sage-dark text-white shadow-md"
                          : "text-cozy-brown/65 hover:text-cozy-dark"
                      }`}
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                {isSignup ? (
                  <form onSubmit={handleSignup}>
                    <div className="mb-8">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-cozy-rose">
                        NEW AROUND HERE?
                      </span>

                      <h2 className="mt-3 font-serif text-3xl font-semibold text-cozy-dark sm:text-4xl">
                        Create your account.
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-cozy-brown/70">
                        Let's make a little place that's yours.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="signup-username" className={labelClass}>
                          Username
                        </label>
                        <input
                          id="signup-username"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          type="text"
                          autoComplete="username"
                          placeholder="YourCozyName"
                          minLength={3}
                          maxLength={24}
                          pattern="[A-Za-z0-9_]+"
                          required
                          className={inputClass}
                        />
                        <p className="mt-2 text-[11px] text-cozy-brown/50">
                          3–24 characters. Letters, numbers, and underscores.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="signup-email" className={labelClass}>
                          Email Address
                        </label>
                        <input
                          id="signup-email"
                          value={signupEmail}
                          onChange={(event) =>
                            setSignupEmail(event.target.value)
                          }
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          required
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="signup-password" className={labelClass}>
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="signup-password"
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                            className={`${inputClass} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-cozy-brown/50 hover:text-cozy-sage-dark"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="signup-confirm" className={labelClass}>
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="signup-confirm"
                            value={confirmPassword}
                            onChange={(event) =>
                              setConfirmPassword(event.target.value)
                            }
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Enter your password again"
                            minLength={8}
                            required
                            className={`${inputClass} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-cozy-brown/50 hover:text-cozy-sage-dark"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={busy}
                        className={`${buttonClass} mt-3`}
                      >
                        {busy ? (
                          <>
                            <LoaderCircle size={17} className="animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create My Account
                            <ArrowRight
                              size={17}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignin}>
                    <div className="mb-8">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-cozy-rose">
                        GOOD TO SEE YOU AGAIN
                      </span>

                      <h2 className="mt-3 font-serif text-3xl font-semibold text-cozy-dark sm:text-4xl">
                        Welcome home.
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-cozy-brown/70">
                        Sign in and return to your little world.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="signin-email" className={labelClass}>
                          Email Address
                        </label>
                        <input
                          id="signin-email"
                          value={signinEmail}
                          onChange={(event) =>
                            setSigninEmail(event.target.value)
                          }
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          required
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="signin-password" className={labelClass}>
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="signin-password"
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            required
                            className={`${inputClass} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-cozy-brown/50 hover:text-cozy-sage-dark"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            showMessage(
                              "Password recovery will be added in a later phase."
                            )
                          }
                          className="text-xs font-semibold text-cozy-rose transition-colors hover:text-cozy-dark"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={busy}
                        className={buttonClass}
                      >
                        {busy ? (
                          <>
                            <LoaderCircle size={17} className="animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In to Cozy Home
                            <ArrowRight
                              size={17}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <form onSubmit={handleVerify}>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setStatus("");
                    setMode("signup");
                  }}
                  className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-cozy-brown/65 transition-colors hover:text-cozy-dark"
                >
                  <ArrowLeft size={15} />
                  Back to sign up
                </button>

                <div className="mb-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cozy-sage/15 text-cozy-sage-dark">
                    <Mail size={25} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-cozy-rose">
                    CHECK YOUR INBOX
                  </span>

                  <h2 className="mt-3 font-serif text-3xl font-semibold text-cozy-dark sm:text-4xl">
                    Verify your email.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-cozy-brown/70">
                    We sent a six-digit code to{" "}
                    <span className="font-bold text-cozy-dark">
                      {signupEmail}
                    </span>
                    . Enter it below to activate your account.
                  </p>
                </div>

                <div className="mb-7 flex justify-between gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      aria-label={`Verification digit ${index + 1}`}
                      className="h-14 min-w-0 flex-1 rounded-xl border border-cozy-brown/15 bg-white/80 text-center text-xl font-bold text-cozy-dark outline-none transition-all focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/15 sm:h-16 sm:text-2xl"
                    />
                  ))}
                </div>

                <button type="submit" disabled={busy} className={buttonClass}>
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify My Email
                      <CheckCircle2 size={17} />
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-cozy-brown/60">
                    Didn't receive the code?
                  </p>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={busy || resendSeconds > 0}
                    className="mt-2 text-xs font-bold text-cozy-rose transition-colors hover:text-cozy-dark disabled:cursor-not-allowed disabled:text-cozy-brown/40"
                  >
                    {resendSeconds > 0
                      ? `Resend code in ${resendSeconds}s`
                      : "Resend verification code"}
                  </button>
                </div>
              </form>
            )}

            {status && (
              <p
                role="status"
                aria-live="polite"
                className={`mt-5 rounded-xl border px-4 py-3 text-xs leading-6 ${
                  statusType === "success"
                    ? "border-cozy-sage/30 bg-cozy-sage/10 text-cozy-sage-dark"
                    : "border-cozy-rose/30 bg-cozy-rose/10 text-cozy-rose"
                }`}
              >
                {status}
              </p>
            )}

            <div className="mt-9 border-t border-cozy-brown/10 pt-6 text-center">
              <p className="text-xs leading-6 text-cozy-brown/60">
                By continuing, you agree to make this little world a welcoming
                place for everyone.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-cozy-rose">
                <Heart size={13} fill="currentColor" />
                Made with love, for lovely people.
              </div>
            </div>
          </section>
        </div>

        <p className="mt-7 text-center text-[10px] font-medium tracking-wider text-cozy-brown/50">
          © {new Date().getFullYear()} COZY HOME · A LITTLE WORLD OF YOUR OWN
        </p>
      </div>
    </main>
  );
}
