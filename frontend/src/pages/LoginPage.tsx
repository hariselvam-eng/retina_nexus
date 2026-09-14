import {
  ArrowRight,
  CheckCircle2,
  Eye,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { login } from '../services/api';
import '../styles/login.css';
export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('anika.menon@clinic.org');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      await login(email, password);

      setSuccess(true);

      // Give the success animation time to play
      setTimeout(() => {
        navigate('/app');
      }, 1100);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to sign in'
      );
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6faf9] text-ink">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-teal-200/20 blur-3xl animate-pulse" />

        <div
          className="absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-200/20 blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="absolute left-[42%] top-[18%] h-3 w-3 rounded-full bg-teal-400/60 animate-ping" />

        <div
          className="absolute right-[18%] top-[28%] h-2 w-2 rounded-full bg-teal-500/50 animate-ping"
          style={{ animationDelay: '800ms' }}
        />

        <div
          className="absolute bottom-[20%] left-[15%] h-2 w-2 rounded-full bg-cyan-400/50 animate-ping"
          style={{ animationDelay: '1.4s' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* LEFT EXPERIENCE */}
        <section className="relative hidden overflow-hidden bg-ink lg:flex lg:w-[52%]">

          {/* Animated circles */}
          <div className="absolute left-[-170px] top-[-170px] h-[560px] w-[560px] rounded-full border border-teal-400/10 animate-[spin_30s_linear_infinite]" />

          <div
            className="absolute left-[-100px] top-[-100px] h-[420px] w-[420px] rounded-full border border-teal-400/10 animate-[spin_22s_linear_infinite_reverse]"
          />

          <div
            className="absolute bottom-[-200px] right-[-150px] h-[520px] w-[520px] rounded-full border border-teal-400/10 animate-[spin_35s_linear_infinite]"
          />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* BRAND */}
            <div className="animate-[fadeInDown_.8s_ease-out]">
              <BrandMark dark />
            </div>

            {/* HERO */}
            <div className="max-w-xl">

              <div
                className="mb-5 flex items-center gap-2 text-teal-300 opacity-0 animate-[fadeInUp_.8s_.25s_ease-out_forwards]"
              >
                <Sparkles size={15} />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
                  The care intelligence layer
                </span>
              </div>

              <h1 className="overflow-hidden text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl">

                <span className="block overflow-hidden">
                  <span className="inline-block opacity-0 animate-[wordReveal_.8s_.35s_cubic-bezier(.16,1,.3,1)_forwards]">
                    See clearly.
                  </span>
                </span>

                <span className="block overflow-hidden">
                  <span className="inline-block text-teal-300 opacity-0 animate-[wordReveal_.8s_.55s_cubic-bezier(.16,1,.3,1)_forwards]">
                    Screen early.
                  </span>
                </span>

                <span className="block overflow-hidden">
                  <span className="inline-block opacity-0 animate-[wordReveal_.8s_.75s_cubic-bezier(.16,1,.3,1)_forwards]">
                    Save sight.
                  </span>
                </span>

              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-slate-300 opacity-0 animate-[fadeInUp_.8s_1s_ease-out_forwards]">
                A self-checking AI workspace designed to help primary care
                teams make retinal screening more explainable, trustworthy,
                and actionable.
              </p>

              {/* FEATURES */}
              <div className="mt-9 space-y-3">

                {[
                  'Quality-first image intake',
                  'Evidence-backed results',
                  'Human review when it matters',
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-300 opacity-0 animate-[fadeInLeft_.7s_ease-out_forwards]"
                    style={{
                      animationDelay: `${1.15 + index * 0.15}s`,
                    }}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-400/10">
                      <CheckCircle2
                        size={15}
                        className="text-teal-300"
                      />
                    </div>

                    <span>{item}</span>
                  </div>
                ))}

              </div>

              {/* FLOATING AI CARD */}
              <div
                className="absolute bottom-20 right-12 hidden w-52 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl xl:block opacity-0 animate-[floatIn_1s_1.5s_ease-out_forwards]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                    <Eye size={19} />

                    <span className="absolute inset-0 rounded-xl border border-teal-300/20 animate-ping" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white">
                      AI Screening
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Self-check active
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-teal-300 animate-[progressGrow_1.5s_1.8s_ease-out_forwards]" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 opacity-0 animate-[fadeIn_.8s_1.5s_ease-out_forwards]">
              RETINA-NEXUS · Prototype workspace · v0.1.0
            </p>
          </div>
        </section>

        {/* RIGHT LOGIN */}
        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">

          <div className="w-full max-w-[410px]">

            {/* MOBILE BRAND */}
            <div className="mb-12 lg:hidden opacity-0 animate-[fadeInDown_.7s_ease-out_forwards]">
              <BrandMark />
            </div>

            {/* LOGIN HEADER */}
            <div className="opacity-0 animate-[fadeInUp_.8s_.2s_ease-out_forwards]">

              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />

                <p className="eyebrow">
                  Secure workspace
                </p>
              </div>

              <h2 className="text-4xl font-extrabold tracking-tight text-ink">
                Welcome
                <span className="text-teal-600"> back.</span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Sign in to access screening, evidence verification,
                and clinician review tools.
              </p>
            </div>

            {/* LOGIN CARD */}
            <div className="mt-8 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,.08)] backdrop-blur-xl opacity-0 animate-[cardReveal_.9s_.4s_cubic-bezier(.16,1,.3,1)_forwards] sm:p-7">

              <form
                onSubmit={submit}
                className="space-y-5"
              >

                {/* EMAIL */}
                <label className="group block">

                  <span className="mb-2 block text-xs font-bold text-ink">
                    Work email
                  </span>

                  <div className="relative">

                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-slate-300 focus:-translate-y-0.5 focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                      placeholder="you@clinic.org"
                    />

                    <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] origin-left scale-x-0 bg-teal-500 transition-transform duration-300 group-focus-within:scale-x-100" />

                  </div>

                </label>

                {/* PASSWORD */}
                <label className="group block">

                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">
                      Password
                    </span>

                    <button
                      type="button"
                      className="text-[11px] font-bold text-teal-700 transition hover:text-teal-500"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">

                    <input
                      required
                      minLength={8}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      className="w-full rounded-xl border border-line bg-white px-4 py-3.5 pr-11 text-sm outline-none transition-all duration-300 placeholder:text-slate-300 focus:-translate-y-0.5 focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                      placeholder="Enter your password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-300 transition hover:bg-slate-50 hover:text-teal-600"
                    >
                      <Eye size={16} />
                    </button>

                    <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] origin-left scale-x-0 bg-teal-500 transition-transform duration-300 group-focus-within:scale-x-100" />

                  </div>

                </label>

                {/* REMEMBER */}
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-200"
                  />
                  Remember me
                </label>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="animate-[shake_.45s_ease-in-out] rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800"
                  >
                    {error}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  disabled={loading || success}
                  className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 ${
                    success
                      ? 'bg-emerald-600'
                      : 'bg-ink hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70'
                  }`}
                >

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {success ? (
                    <>
                      <CheckCircle2
                        size={17}
                        className="animate-[successPop_.45s_ease-out]"
                      />
                      Access granted
                    </>
                  ) : loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in to workspace
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>
              </form>

              {/* SECURITY */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-3.5 text-xs leading-5 text-teal-800">

                <div className="mt-0.5 rounded-lg bg-teal-100 p-1.5">
                  <ShieldCheck
                    size={14}
                    className="text-teal-700"
                  />
                </div>

                <span>
                  Access is protected by workspace roles and audit
                  logging. This prototype does not claim regulatory
                  certification.
                </span>

              </div>

            </div>

            <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 opacity-0 animate-[fadeIn_.8s_1.2s_ease-out_forwards]">
              Secure clinical workspace
            </p>

          </div>
        </section>
      </div>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-md animate-[fadeIn_.35s_ease-out]">

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-400/10">

              <CheckCircle2
                size={42}
                className="text-teal-300 animate-[successPop_.6s_cubic-bezier(.16,1,.3,1)]"
              />

            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-teal-300">
              Authentication successful
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-white">
              Opening your workspace
            </h2>

            <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left animate-[progressGrow_1s_ease-out] bg-teal-300" />
            </div>

          </div>

        </div>
      )}

      {/* LOCAL ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-25px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes wordReveal {
          from {
            opacity: 0;
            transform: translateY(110%);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(35px) scale(.97);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes progressGrow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes successPop {
          0% {
            opacity: 0;
            transform: scale(.4);
          }
          70% {
            transform: scale(1.15);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </main>
  );
}