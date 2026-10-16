import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface IntroMotionProps {
  onComplete: () => void;
}

export const IntroMotion: React.FC<IntroMotionProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Stage 1: Initial suits float and cards emerge
    const t1 = setTimeout(() => setStage(1), 100);
    // Stage 2: Crown glints and title bursts
    const t2 = setTimeout(() => setStage(2), 600);
    // Stage 3: Full brilliance and suits lock
    const t3 = setTimeout(() => setStage(3), 1100);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5; // ~2 seconds total
      });
    }, 45);

    // Auto dismiss at ~2.4 seconds
    const finishTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(finishTimer);
      clearInterval(interval);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#03130e] select-none cursor-pointer overflow-hidden transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 35%, rgba(6, 78, 59, 0.55) 0%, rgba(2, 44, 34, 0.85) 50%, #021a14 100%)',
      }}
    >
      {/* Background Ambient Glows & Floating Card Suits */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Radial Pulses */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl" />

        {/* Floating ♠ Sapphire Spade */}
        <div
          className={`absolute top-[18%] left-[10%] sm:left-[22%] text-3xl sm:text-4xl text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] transition-all duration-1000 transform ${
            stage >= 1 ? 'opacity-70 scale-100 translate-y-0 rotate-[-12deg]' : 'opacity-0 scale-50 translate-y-8'
          }`}
        >
          ♠
        </div>

        {/* Floating ♥ Ruby Heart */}
        <div
          className={`absolute top-[16%] right-[10%] sm:right-[22%] text-3xl sm:text-4xl text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)] transition-all duration-1000 transform ${
            stage >= 1 ? 'opacity-75 scale-100 translate-y-0 rotate-[15deg]' : 'opacity-0 scale-50 translate-y-8'
          }`}
        >
          ♥
        </div>

        {/* Floating ♦ Amber Diamond */}
        <div
          className={`absolute bottom-[28%] left-[12%] sm:left-[24%] text-3xl sm:text-4xl text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] transition-all duration-1000 transform ${
            stage >= 2 ? 'opacity-75 scale-100 translate-y-0 rotate-[8deg]' : 'opacity-0 scale-50 translate-y-8'
          }`}
        >
          ♦
        </div>

        {/* Floating ♣ Emerald Club */}
        <div
          className={`absolute bottom-[26%] right-[12%] sm:right-[24%] text-3xl sm:text-4xl text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)] transition-all duration-1000 transform ${
            stage >= 2 ? 'opacity-75 scale-100 translate-y-0 rotate-[-10deg]' : 'opacity-0 scale-50 translate-y-8'
          }`}
        >
          ♣
        </div>
      </div>

      {/* Top Header spacer */}
      <div className="w-full flex items-center justify-end z-10 pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-emerald-300/80 hover:text-white bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/20 backdrop-blur transition-all"
        >
          <span>ورود به بازی</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centerpiece: The Animated Colorful Shelem Logo */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-10">
        <div className="relative flex flex-col items-center">
          
          {/* Logo Frame Container with Glowing Rim */}
          <div
            className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl p-1 transition-all duration-700 ease-out transform ${
              stage >= 1 ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-[-8deg]'
            }`}
          >
            {/* Outer Animated Gradient Glow Halo */}
            <div className="absolute -inset-2.5 rounded-[32px] bg-gradient-to-r from-amber-500/30 via-emerald-400/30 to-rose-500/30 blur-xl opacity-80 animate-pulse pointer-events-none" />

            {/* Logo Image */}
            <div className="relative w-full h-full rounded-[26px] overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#011710] flex items-center justify-center">
              <img
                src="/icon.svg"
                alt="شلم پرو"
                className={`w-full h-full object-contain p-2 transition-transform duration-1000 ${
                  stage >= 2 ? 'scale-100' : 'scale-90'
                }`}
              />

              {/* Shimmer Light Bar */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none transition-transform duration-1000 ${
                  stage >= 2 ? 'translate-x-full -translate-y-full' : '-translate-x-full translate-y-full'
                }`}
              />
            </div>

            {/* Sparkle Badges */}
            <div
              className={`absolute -top-3 -right-3 text-amber-300 transition-all duration-500 ${
                stage >= 2 ? 'scale-100 opacity-100 rotate-12' : 'scale-0 opacity-0'
              }`}
            >
              <Sparkles className="w-7 h-7 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>
          </div>

          {/* Persian App Name with Rich Gradient */}
          <div
            className={`mt-6 text-center transition-all duration-700 delay-200 transform ${
              stage >= 2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
            }`}
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)]">
              شلم پرو
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-semibold tracking-widest text-emerald-300/90 uppercase font-sans">
              SHELEM PRO
            </p>
            <div className="mt-2 text-[11px] sm:text-xs text-emerald-100/70 font-medium">
              دستیار و امتیاز شمار هوشمند بازی شلم
            </div>
          </div>

          {/* Four Mini Colored Suit Badges below Title */}
          <div
            className={`flex items-center gap-3 mt-4 transition-all duration-500 delay-300 ${
              stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-400 flex items-center justify-center text-xs shadow-sm">
              ♠
            </span>
            <span className="w-6 h-6 rounded-full bg-rose-950/80 border border-rose-400/40 text-rose-400 flex items-center justify-center text-xs shadow-sm">
              ♥
            </span>
            <span className="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-400/40 text-amber-400 flex items-center justify-center text-xs shadow-sm">
              ♦
            </span>
            <span className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-xs shadow-sm">
              ♣
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Loading Progress & Creator Credit */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 z-10 pb-4">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-500/20">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-300 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-emerald-300/60 px-1">
          <span>نسخه ۲.۲</span>
          <span className="font-mono">{Math.min(100, Math.round(progress))}%</span>
          <span>محمدرضا امیریوسفی</span>
        </div>
      </div>
    </div>
  );
};
