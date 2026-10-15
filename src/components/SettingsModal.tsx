import React, { useState } from 'react';
import { X, Palette, Sliders, Check, RefreshCw, Type, Eye } from 'lucide-react';
import { GameSettings, GameState } from '../types/shelem';
import { toPersianDigits } from '../utils/shelemEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (settings: GameSettings) => void;
  game: GameState;
  onUpdateTeamNames: (teamAName: string, teamBName: string) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  game,
  onUpdateTeamNames,
  onResetGame,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'rules'>('appearance');

  // Local settings state
  const [currentTheme, setCurrentTheme] = useState(settings.theme);
  const [currentFont, setCurrentFont] = useState(settings.fontFamily);
  const [currentFontSize, setCurrentFontSize] = useState(settings.fontSize);
  const [persianDigits, setPersianDigits] = useState(settings.persianDigits);

  const [targetScore, setTargetScore] = useState(settings.targetScore);
  const [shelemBonus, setShelemBonus] = useState(settings.shelemBonus);
  const [penaltyType, setPenaltyType] = useState(settings.penaltyType);
  const [allowDouble, setAllowDouble] = useState(settings.allowDouble);

  // Team names state
  const [teamAName, setTeamAName] = useState(game.teamAName);
  const [teamBName, setTeamBName] = useState(game.teamBName);

  if (!isOpen) return null;

  const themes = [
    {
      id: 'emerald',
      name: 'سبز ماهوت شلم',
      desc: 'کلاسیک میز بازی',
      colors: ['#042f2e', '#064e3b', '#f59e0b'],
    },
    {
      id: 'onyx',
      name: 'مشکی الماسی',
      desc: 'دارک متالیک و مینیمال',
      colors: ['#09090b', '#18181b', '#38bdf8'],
    },
    {
      id: 'crimson',
      name: 'زرشکی درباری',
      desc: 'مخملی کازینویی لوکس',
      colors: ['#2d0b14', '#4c1120', '#fbbf24'],
    },
    {
      id: 'navy',
      name: 'سرمه‌ای اقیانوسی',
      desc: 'شبانه با کنتراست فیروزه‌ای',
      colors: ['#081426', '#0f2342', '#06b6d4'],
    },
    {
      id: 'amethyst',
      name: 'بنفش نئونی',
      desc: 'مدرن و متمایز',
      colors: ['#170b24', '#2b1344', '#ec4899'],
    },
    {
      id: 'paper',
      name: 'روشن مینیمال',
      desc: 'کاغذی و تمیز در نور روز',
      colors: ['#f8fafc', '#ffffff', '#0f766e'],
    },
  ] as const;

  const fonts = [
    { id: 'vazir', name: 'وزیرمتن (پیش‌فرض مدرن)' },
    { id: 'shabnam', name: 'شبنم (خوانا و زیبا)' },
    { id: 'sahel', name: 'ساحل (کلاسیک و ملایم)' },
    { id: 'estedad', name: 'استعداد (هندسی)' },
    { id: 'system', name: 'قلم سیستمی دستگاه' },
  ] as const;

  const quickTargets = [1000, 1165, 1200, 1500, 2000, 2500];
  const quickShelems = [330, 500, 600];

  const handleApply = () => {
    onSaveSettings({
      ...settings,
      theme: currentTheme,
      fontFamily: currentFont,
      fontSize: currentFontSize,
      persianDigits,
      targetScore,
      shelemBonus,
      penaltyType,
      allowDouble,
    });
    if (teamAName.trim() && teamBName.trim()) {
      onUpdateTeamNames(teamAName.trim(), teamBName.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[var(--color-text-main)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/50">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold">تنظیمات شلم پرو</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="grid grid-cols-2 p-1 bg-[var(--color-canvas)]/80 border-b border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'appearance'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>شخصی‌سازی ظاهر</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rules'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>قوانین و جزئیات بازی</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'appearance' ? (
            <>
              {/* Theme Picker */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                  انتخاب تم رنگی محیط بازی:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCurrentTheme(t.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer relative ${
                        currentTheme === t.id
                          ? 'border-[var(--color-accent)] bg-[var(--color-surface-hover)] shadow-md ring-1 ring-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 hover:border-[var(--color-border)]/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        {t.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="text-xs font-bold text-[var(--color-text-main)]">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Font Picker */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                  فونت متن‌ها و اعداد:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCurrentFont(f.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                        currentFont === f.id
                          ? 'border-[var(--color-accent)] bg-[var(--color-surface-hover)] text-[var(--color-accent)] font-bold'
                          : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-main)]'
                      }`}
                    >
                      <span className="text-xs">{f.name}</span>
                      {currentFont === f.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Scaling */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                  اندازه متن و اعداد روی تابلوی بازی:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setCurrentFontSize(sz)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        currentFontSize === sz
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-bold'
                          : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)]'
                      }`}
                    >
                      {sz === 'normal' ? 'عادی' : sz === 'large' ? 'درشت' : 'خیلی درشت'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persian Digits Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-canvas)]/30 border border-[var(--color-border)]">
                <div>
                  <span className="text-xs font-bold text-[var(--color-text-main)]">ارقام فارسی</span>
                  <p className="text-[11px] text-[var(--color-text-muted)]">نمایش ارقام به صورت ۱۲۳ یا 123</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPersianDigits(!persianDigits)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    persianDigits ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      persianDigits ? 'left-1' : 'right-1'
                    }`}
                  />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Target Score */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">
                    سقف امتیاز پایان بازی (برد):
                  </label>
                  <span className="text-base font-extrabold text-[var(--color-accent)] font-tabular">
                    {toPersianDigits(targetScore, persianDigits)} امتیاز
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {quickTargets.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setTargetScore(q)}
                      className={`py-2 text-xs font-bold font-tabular rounded-lg border transition-all ${
                        targetScore === q
                          ? 'bg-[var(--color-accent)] text-neutral-950 border-[var(--color-accent)]'
                          : 'bg-[var(--color-canvas)]/40 border-[var(--color-border)] text-[var(--color-text-main)]'
                      }`}
                    >
                      {toPersianDigits(q, persianDigits)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step={50}
                  min={500}
                  max={5000}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] font-tabular focus:border-[var(--color-accent)] outline-none"
                  placeholder="عدد دلخواه سقف امتیاز..."
                />
              </div>

              {/* Shelem Bonus */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">
                    امتیاز شلم (بردن تمام دست‌ها):
                  </label>
                  <span className="text-base font-extrabold text-amber-400 font-tabular">
                    +{toPersianDigits(shelemBonus, persianDigits)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {quickShelems.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setShelemBonus(b)}
                      className={`py-2 text-xs font-bold font-tabular rounded-lg border transition-all ${
                        shelemBonus === b
                          ? 'bg-amber-500 text-neutral-950 border-amber-400'
                          : 'bg-[var(--color-canvas)]/40 border-[var(--color-border)] text-[var(--color-text-main)]'
                      }`}
                    >
                      {toPersianDigits(b, persianDigits)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penalty Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                  نحوه محاسبه جریمه خالی کردن حاکم (نرسیدن به تعهد):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPenaltyType('bidAmount')}
                    className={`p-2.5 rounded-xl border text-right text-xs transition-all ${
                      penaltyType === 'bidAmount'
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface-hover)] font-bold text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)]'
                    }`}
                  >
                    <div>منفی میزان تعهد</div>
                    <div className="text-[10px] opacity-75">استاندارد (مثلاً ۱۲۰- برای تعهد ۱۲۰)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPenaltyType('doubleBid')}
                    className={`p-2.5 rounded-xl border text-right text-xs transition-all ${
                      penaltyType === 'doubleBid'
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface-hover)] font-bold text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)]'
                    }`}
                  >
                    <div>منفی دوبرابر تعهد</div>
                    <div className="text-[10px] opacity-75">قانون سنگین (مثلاً ۲۴۰- برای تعهد ۱۲۰)</div>
                  </button>
                </div>
              </div>

              {/* Allow Double Multiplier Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-canvas)]/30 border border-[var(--color-border)]">
                <div>
                  <span className="text-xs font-bold text-[var(--color-text-main)]">امکان انتخاب دست «دوبل»</span>
                  <p className="text-[11px] text-[var(--color-text-muted)]">نمایش گزینه دوبل (Doble 2x) هنگام ثبت دست</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDouble(!allowDouble)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    allowDouble ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      allowDouble ? 'left-1' : 'right-1'
                    }`}
                  />
                </button>
              </div>

              {/* Team Names Editor */}
              <div className="space-y-2 pt-2 border-t border-[var(--color-border)]/60">
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                  نام‌های دو تیم:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-[var(--color-badge-a)] block mb-1">تیم اول</span>
                    <input
                      type="text"
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:border-[var(--color-accent)] outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-badge-b)] block mb-1">تیم دوم</span>
                    <input
                      type="text"
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:border-[var(--color-accent)] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone: Reset Game */}
              <div className="pt-3 border-t border-[var(--color-border)]/60">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام دست‌ها پاک شده و بازی صفر شود؟')) {
                      onResetGame();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>صفر کردن و شروع مجدد دست‌ها</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-canvas)]/60 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            اعمال و ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};
