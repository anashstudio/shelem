import React, { useState } from 'react';
import { X, Info, Globe, Mail, User, ShieldCheck, Heart, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { GameSettings } from '../types/shelem';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const websiteUrl = 'https://www.zaiem-co.ir';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[var(--color-text-main)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-main)]">
                درباره نرم‌افزار شلم پرو
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                شناسنامه و مشخصات سازنده برنامه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Creator Profile Card */}
          <div className="p-4 rounded-2xl bg-[var(--color-canvas)]/80 border border-[var(--color-border)] relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 flex items-center justify-center text-[var(--color-accent)] font-bold text-lg shrink-0 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[var(--color-accent)] font-semibold">
                    سازنده نرم‌افزار
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    توسعه‌دهنده رسمی
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] mt-0.5">
                  محمدرضا امیریوسفی
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  طراحی، برنامه‌نویسی و پیاده‌سازی موتور هوشمند قوانین و امتیازدهی شلم
                </p>
              </div>
            </div>

            {/* Contact / Website Box */}
            <div className="mt-4 pt-3.5 border-t border-[var(--color-border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs">
                <Globe className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span className="text-[var(--color-text-muted)]">وب‌سایت و ارتباط:</span>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="font-medium text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 font-mono text-xs"
                >
                  <span>{websiteUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-main)] transition-colors active:scale-95"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      <span>کپی آدرس</span>
                    </>
                  )}
                </button>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                >
                  <span>باز کردن سایت</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* App Overview Card */}
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[var(--color-text-main)]">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <span>ویژگی‌ها و قابلیت‌های شلم پرو</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--color-text-muted)] list-none pr-1">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">✓</span>
                <span>محاسبه خودکار و دقیق بر اساس آخرین قوانین رسمی بازی شلم (حاکم خالی کرد، به تعهد خود نرسید و امتیازات دست)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">✓</span>
                <span>قانون شلم کامل: ۵۰۰ امتیاز مثبت در صورت موفقیت شلم، و ۵۰۰ امتیاز منفی در صورت خواندن شلم و گرفتن حداقل ۵ امتیاز توسط تیم حریف</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">✓</span>
                <span>انتخاب گام‌های ۵ تایی جهت سرعت و دقت حداکثری در ثبت دست‌ها</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">✓</span>
                <span>پوسته‌های متنوع و چشم‌نواز (کازینو، تاریک لوکس، پاسور کلاسیک و ...) با تایپوگرافی اصیل فارسی</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">✓</span>
                <span>ذخیره‌سازی هوشمند و دائمی تاریخچه دست‌ها و ادامه بازی در مراجعات بعدی بدون نیاز به اینترنت</span>
              </li>
            </ul>
          </div>

          {/* Version and Brand */}
          <div className="flex items-center justify-between px-2 text-[11px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>ساخته شده با عشق برای علاقه‌مندان به شلم</span>
            </span>
            <span className="font-mono bg-[var(--color-canvas)] px-2 py-0.5 rounded border border-[var(--color-border)]">
              نسخه ۱.۱.۰
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-canvas)]/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
