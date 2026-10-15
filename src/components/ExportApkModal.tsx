import React, { useState } from 'react';
import { X, Download, Github, Smartphone, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { GameSettings } from '../types/shelem';

interface ExportApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
}

export const ExportApkModal: React.FC<ExportApkModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  React.useEffect(() => {
    // Check if already in standalone app mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const targetRepo = repoUrl.trim() || 'https://github.com/anashstudio/shelem.git';

  const gitCommands = `git init
git add .
git commit -m "feat: Shelem Pro Android App"
git branch -M main
git remote add origin ${targetRepo}
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'برای نصب مستقیم روی گوشی در مرورگر کروم/سامسونگ:\nروی منوی سه‌نقطه مرورگر (⋮) بزنید و گزینه «افزودن به صفحه اصلی» یا «Install app» را انتخاب کنید.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[var(--color-text-main)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                راهنمای دریافت فایل خروجی APK اندروید
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                ساخت خودکار APK از طریق GitHub Actions و Capacitor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Quick Explanation */}
          <div className="p-3.5 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-text-main)] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--color-accent)]">
              <ShieldCheck className="w-4 h-4" />
              <span>پایپ‌لاین خودکار بیلد APK در این پروژه تعبیه شده است!</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              فایل خودکارسازی <code className="text-[var(--color-accent)] font-mono">.github/workflows/build-apk.yml</code> و تنظیمات بومی <code className="text-[var(--color-accent)] font-mono">capacitor.config.json</code> آماده است. به محض اینکه کدها را در اکانت گیت‌هاب خود پوش (Push) کنید، سرورهای گیت‌هاب فایل <strong className="text-white">shelem-pro-debug.apk</strong> را به صورت رایگان می‌سازند و تحویل می‌دهند.
            </p>
          </div>

          {/* Step by Step Flow */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[var(--color-text-main)] flex items-center gap-1.5">
              <Github className="w-4 h-4 text-[var(--color-accent)]" />
              <span>مراحل ۳ گانه دریافت مستقیم فایل APK:</span>
            </h4>

            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-[var(--color-canvas)]/50 border border-[var(--color-border)] space-y-2">
              <div className="font-semibold text-xs text-[var(--color-text-main)]">
                ۱. آدرس ریپازیتوری گیت‌هاب خود را وارد کنید (اختیاری):
              </div>
              <input
                type="text"
                dir="ltr"
                placeholder="https://github.com/username/shelem-app.git"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] font-mono outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            {/* Step 2: Git commands */}
            <div className="p-3 rounded-xl bg-[var(--color-canvas)]/50 border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[var(--color-text-main)] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  <span>۲. این دستورات را در ترمینال یا گیت‌بش پروژه اجرا کنید:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی تمام دستورات</span>
                    </>
                  )}
                </button>
              </div>

              <pre dir="ltr" className="p-2.5 rounded-lg bg-neutral-950 text-neutral-300 font-mono text-[11px] overflow-x-auto border border-neutral-800 leading-relaxed">
                {gitCommands}
              </pre>
            </div>

            {/* Step 3: Download APK */}
            <div className="p-3 rounded-xl bg-[var(--color-canvas)]/50 border border-[var(--color-border)] space-y-1.5">
              <div className="font-semibold text-xs text-[var(--color-text-main)]">
                ۳. دانلود فایل APK از تب Actions گیت‌هاب:
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                وارد صفحه ریپازیتوری خود در GitHub شوید و روی تب <strong className="text-white">Actions</strong> کلیک کنید. بیلد <strong className="text-white">Build Android APK</strong> را باز کرده و در بخش <strong className="text-[var(--color-accent)]">Artifacts</strong>، فایل نصبی <strong className="text-white">shelem-pro-debug-apk</strong> را با یک کلیک دانلود و روی گوشی نصب نمایید!
              </p>
            </div>
          </div>

          {/* Alternative Instant PWA Install */}
          {!isStandalone && (
            <div className="p-3.5 rounded-xl bg-[var(--color-canvas)]/30 border border-dashed border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-[var(--color-text-main)] block">
                  نصب آنی به عنوان وب‌اپلیکیشن (PWA)
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)] block">
                  بدون نیاز به گیت‌هاب، همین الان مانند یک برنامه واقعی روی صفحه گوشی قرار می‌گیرد.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDirectPwaInstall}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-bold text-[var(--color-text-main)] flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>نصب روی گوشی (PWA)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-canvas)]/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
