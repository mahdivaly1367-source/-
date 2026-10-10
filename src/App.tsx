/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Disc,
  FileText,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  highlights: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'audiotest' | 'perspective'>('overview');
  const [selectedDocId, setSelectedDocId] = useState<string>('gdd');
  
  // Audio Simulator state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [filterFrequency, setFilterFrequency] = useState(440);
  const [noiseLevel, setNoiseLevel] = useState(40);
  const [tapeSpeed, setTapeSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [vuValue, setVuValue] = useState(35);

  // Web Audio Context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const biquadRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Perspective simulation state
  const [characterY, setCharacterY] = useState(65); // percentage in walkable area
  const [characterX, setCharacterX] = useState(50);

  // Dynamic Scale Formula based on ADR-003:
  // Scale(Y) = S_min + ((Y - Y_min) / (Y_max - Y_min)) * (S_max - S_min)
  // Y_min = 40 (far background, scale 0.75), Y_max = 90 (near foreground, scale 1.05)
  const calculateScale = (y: number) => {
    const minY = 35;
    const maxY = 90;
    const clampedY = Math.max(minY, Math.min(maxY, y));
    const factor = (clampedY - minY) / (maxY - minY);
    return (0.75 + factor * (1.10 - 0.75)).toFixed(2);
  };

  const calculatedScale = calculateScale(characterY);

  // VU Meter fluctuation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        const base = noiseLevel * 0.4 + (filterFrequency / 2000) * 30;
        const jitter = (Math.random() - 0.5) * 20;
        setVuValue(Math.max(10, Math.min(95, Math.round(base + jitter))));
      }, 100);
    } else {
      setVuValue(5);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, noiseLevel, filterFrequency]);

  // Handle Play/Stop Web Audio Test
  const toggleAudioSimulation = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const biquad = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(tapeSpeed === 'slow' ? 220 : tapeSpeed === 'fast' ? 880 : 440, ctx.currentTime);

      biquad.type = 'lowpass';
      biquad.frequency.setValueAtTime(filterFrequency, ctx.currentTime);

      gain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);

      osc.connect(biquad);
      biquad.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      biquadRef.current = biquad;
      gainRef.current = gain;

      setIsPlayingAudio(true);
    } catch {
      // Audio autoplay might be blocked
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    } catch {
      // ignore
    }
    oscRef.current = null;
    audioCtxRef.current = null;
    setIsPlayingAudio(false);
  };

  const updateFilter = (freq: number) => {
    setFilterFrequency(freq);
    if (biquadRef.current && audioCtxRef.current) {
      biquadRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    }
  };

  const docSections: DocSection[] = [
    {
      id: 'gdd',
      title: 'سند طراحی بازی (GDD)',
      badge: 'GDD.md',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      summary: 'مفاهیم پایه، حلقه‌های گیم‌پلی اشاره و کلیک، مکانیک‌های بازسازی صوت، دفترچه استنتاج و ساختار سه‌پرده‌ای روایی.',
      highlights: [
        'ژانر: ماجراجویی رازآلود نوآر ساحلی در فضای مرطوب شمال ایران (بندر مه‌آب)',
        'حلقه اصلی: کاوش محیط ⟵ جمع‌آوری نوارها و اسناد ⟵ فیلتر صدا در میز کار ⟵ اتصال شواهد در ژورنال',
        'عدم وجود بن‌بست (Zero Dead-Ends) و راهنماهای ۳ مرحله‌ای درون‌جهانی'
      ]
    },
    {
      id: 'story',
      title: 'کتابچه داستان (Story Bible)',
      badge: 'STORY_BIBLE.md',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      summary: 'حقیقت نهایی ماجرای توفان ۲۳ آبان ۱۳۷۸، شخصیت‌پردازی آوا و سهراب راد، خیانت مهندس دانشیار، و فرکانس اضطراری ۴۱۵۵ کیلوهرتز.',
      highlights: [
        'حقیقت ماجرا: شناور ققنوس حامل بار قاچاق گمرکی بود و دانشیار برای عدم بازرسی دستور قطع فرستنده را داد.',
        'سهراب راد با فداکاری روی باند پشتیبان ۱۳ مکالمات را ضبط کرد و توسط توطئه‌گران متهم به اهمال‌کاری شد.',
        'سرنخ‌های منصفانه، علل واقعی پنهان‌کاری، سرنوشت واقعی پدر و پایان‌بندی احساسی با اعاده حیثیت در برابر مردم شهر.'
      ]
    },
    {
      id: 'puzzles',
      title: 'طراحی معماها (Puzzle Design)',
      badge: 'PUZZLE_DESIGN.md',
      icon: <Sliders className="w-5 h-5 text-cyan-400" />,
      summary: 'زنجیره دقیق ۴ معمای اصلی بر پایه شواهد عینی، بدون حدس و گمان یا قفل‌های بی‌معنی.',
      highlights: [
        'معمای ۱: راه‌اندازی و کالیبراسیون ضبط ریل ریواکس با فیوز ۲ آمپر، سلکتور ۱۱۰ ولت و سرعت ۱۹ سانتی‌متر/ثانیه',
        'معمای ۲: فیلتر نویز امواج و استخراج فرکانس ۴۰ هرتز موتور یانمار ققنوس جهت اثبات باری بودن شناور',
        'معمای ۳: اثبات قطع مکانیکی فیوز با انبردست بهمن و خط‌خوردگی دفترچه ورود و خروج کشیک',
        'معمای ۴: گاوصندوق آکوستیک زیر کف استودیو با فرکانس افتتاحیه ۱۳۵۹ کیلوهرتز و دیاپازون نقره‌ای سهراب'
      ]
    },
    {
      id: 'visual',
      title: 'هویت بصری و پرسپکتیو (Visual Bible)',
      badge: 'VISUAL_BIBLE.md',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      summary: 'رئالیسم نقاشانه سینمایی، لایه‌بندی پس‌زمینه و جلو، حل قطعی مشکل شناور ماندن پای کاراکتر و پرسپکتیو پویا.',
      highlights: [
        'تثبیت اجباری نقطه لنگر رندرینگ اسپرایت کاراکتر روی مختصات [50%, 96%] (پاشنه پا)',
        'محاسبه پیوسته اندازه اسپرایت از ۰.۷۵ تا ۱.۱۰ بر اساس مختصات عمودی Y پای کاراکتر',
        'پالت رنگی ۶ لوکیشن: خاکستری مه‌آلود، کهربایی لامپ‌های خلأ و زنگار فلزات ساحلی'
      ]
    },
    {
      id: 'tech',
      title: 'مشخصات فنی و داده‌محوری (Tech Spec)',
      badge: 'TECH_SPEC.md',
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
      summary: 'معماری اعلانی، جداسازی کامل محتوا از موتور، ماژول Web Audio API و سیستم ذخیره‌سازی جامع در LocalStorage.',
      highlights: [
        'مدل جامع GameState شامل وضعیت کاراکتر، اینونتوری، پرچم‌های داستان، سرنخ‌ها و معماها',
        'موتور صوتی Native DSP با BiquadFilterNode و AnalyserNode بدون وابستگی سنگین خارجی',
        'سیستم ذخیره‌سازی مقاوم در برابر بازنشانی، تایپ‌های کاملاً ایمن در TypeScript'
      ]
    },
    {
      id: 'tests',
      title: 'معیارهای پذیرش و تست (Acceptance Tests)',
      badge: 'ACCEPTANCE_TESTS.md',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-400" />,
      summary: 'ماتریس ۱۷ آزمون اعتبارسنجی کیفی، روایی و فنی از جمله عدم تداخل UI با هات‌اسپات‌ها و ماندگاری داده پس از F5.',
      highlights: [
        'TC-NAV / TC-PER: اعتبارسنجی حرکت آوا در پلی‌گون مجاز و تغییر مقیاس صحیح بدون افت فریم',
        'TC-HOT / TC-INV: پیشگیری از نشت رویدادهای کلیک منو و ثبت بی‌درنگ اشیا در اینونتوری',
        'TC-SAV-01: پایداری ۱۰۰٪ بازیابی وضعیت با رفرش صفحه مرورگر'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Vazirmatn',sans-serif]">
      {/* Top Navigation & Status Bar */}
      <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-amber-100 tracking-wide">فرکانس خاموش: پروندهٔ نوار سیزدهم</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  مرحله صفر: طراحی کامل و مشخصات SDD
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                ماجراجویی رازآلود اشاره و کلیک • ایستگاه مخابرات دریایی بندر مه‌آب
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-stone-800 text-amber-300 font-medium shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Info className="w-4 h-4" />
              شناسنامه بازی
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'docs'
                  ? 'bg-stone-800 text-amber-300 font-medium shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              اسناد جامع (۱۰ سند)
            </button>
            <button
              onClick={() => setActiveTab('audiotest')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'audiotest'
                  ? 'bg-stone-800 text-amber-300 font-medium shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Disc className="w-4 h-4" />
              شبیه‌ساز میز نوار سیزدهم
            </button>
            <button
              onClick={() => setActiveTab('perspective')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'perspective'
                  ? 'bg-stone-800 text-amber-300 font-medium shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              آزمون پرسپکتیو و پاشنه پا
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cinematic Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-b from-stone-900 to-stone-950 p-6 sm:p-8">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  برش داستانی و اتمسفر سینمایی
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 leading-relaxed">
                  «حقیقت در برابر امواج دریا گم نمی‌شود؛ تنها در انتظار گوشی شنوا می‌ماند.»
                </h2>
                <p className="text-stone-300 leading-relaxed text-sm sm:text-base">
                  شانزده سال قبل، در شبی توفانی با باران‌های بی‌پایان در آبان ۱۳۷۸، شناور صیادی «ققنوس» در نزدیکی صخره سیاه غرق شد و ۵ ملوان جان باختند. گزارش‌های رسمی پدر آوا، «سهراب راد» را مسئول تأخیر مخابره پیام اعلام کردند. اکنون، بسته‌ای ناشناس حاوی یک حلقه نوار ریل مغناطیسی ۶ میلی‌متری با عنوان <strong className="text-amber-400 font-semibold">«نوار سیزدهم»</strong> به دست آوا راد رسیده است؛ در حالی که لودرهای شهرداری ظرف ۷۲ ساعت آینده قرار است آخرین شاهد فیزیکی ماجرا—ایستگاه رادیویی کهنه ساحل—را ویران کنند.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                    <span className="text-xs text-stone-400 block">شخصیت محوری:</span>
                    <strong className="text-stone-200 text-sm">آوا راد (۳۲ ساله)</strong>
                    <span className="text-xs text-amber-400/90 block mt-0.5">کارشناس مرمت آرشیوهای صوتی</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                    <span className="text-xs text-stone-400 block">لوکیشن روایی:</span>
                    <strong className="text-stone-200 text-sm">بندر مه‌آب (دریای مازندران)</strong>
                    <span className="text-xs text-amber-400/90 block mt-0.5">نوآر بارانی، معماری چوب و سیمان</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800">
                    <span className="text-xs text-stone-400 block">فرکانس اضطراری:</span>
                    <strong className="text-stone-200 text-sm">۴۱۵۵ کیلوهرتز (باند ۱۳)</strong>
                    <span className="text-xs text-amber-400/90 block mt-0.5">کانال پشتیبان رادیویی سهراب</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800/80 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-200 text-base">استنتاج عینی بدون حدس کورکورانه</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  هیچ معمایی با حدس تصادفی اعداد یا قفل‌های بی‌معنی حل نمی‌شود؛ تمام راه‌حل‌ها ناشی از تطبیق اسناد گمرک، صدای موتور شناور، و بازجویی‌های منطقی است.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800/80 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Disc className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-200 text-base">مکانیک‌های صوتی در قلب کارآگاهی</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  آوا از فیلترهای فرکانسی آنالوگ، سرعت چرخش نوار ریل و تحلیل نویز پس‌زمینه برای ایزوله کردن مکالمات پنهان و اثبات حقایق استفاده می‌کند.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800/80 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-200 text-base">استاندارد مهار پا و پرسپکتیو پیوسته</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  رفع ریشه‌ای مشکل شناور شدن پای کاراکتر با تثبیت Foot Anchor روی ۹۶٪ و محاسبه پیوسته مقیاس اسپرایت نسبت به عمق هندسی صحنه.
                </p>
              </div>
            </div>

            {/* Quick Actions / Jump to Phase 1 Preview */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-amber-200">مرحله صفر (تدوین اسناد و مشخصات) آماده است</h4>
                  <p className="text-xs text-stone-300">
                    برای بررسی ماژول‌های شبیه‌سازی فنی صوت و پرسپکتیو، از تب‌های بالای صفحه استفاده فرمایید.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('docs')}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                >
                  مطالعه اسناد ۱۰ گانه
                </button>
                <button
                  onClick={() => setActiveTab('audiotest')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors"
                >
                  تست نوار سیزدهم
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPECIFICATION DOCUMENTS */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-100">اسناد معماری و طراحی مرحله صفر (Spec-Driven Architecture)</h2>
              <p className="text-xs text-stone-400 mt-1">
                کلیه مشخصات به صورت فایل‌های مستقل در پوشه <code className="bg-stone-900 px-1.5 py-0.5 rounded text-amber-400 text-xs">/docs</code> ایجاد شده و آماده بهره‌برداری در فازهای پیاده‌سازی می‌باشند.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Document Selector Sidebar */}
              <div className="space-y-2">
                {docSections.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      selectedDocId === doc.id
                        ? 'bg-amber-500/10 border-amber-500/40 text-stone-100 shadow-sm'
                        : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                    }`}
                  >
                    <div className="mt-0.5">{doc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm truncate">{doc.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-stone-400 block mt-0.5">{doc.badge}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Document Content View */}
              <div className="md:col-span-2 rounded-2xl bg-stone-900/80 border border-stone-800 p-6 space-y-4">
                {(() => {
                  const currentDoc = docSections.find((d) => d.id === selectedDocId) || docSections[0];
                  return (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          {currentDoc.icon}
                          <div>
                            <h3 className="font-bold text-lg text-amber-200">{currentDoc.title}</h3>
                            <span className="text-xs font-mono text-stone-400">مسیر فایل: docs/{currentDoc.badge}</span>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded bg-stone-800 text-stone-300 border border-stone-700">
                          وضعیت: تدوین کامل
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">خلاصه اجرایی سند:</h4>
                        <p className="text-sm text-stone-300 leading-relaxed bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/60">
                          {currentDoc.summary}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">محورها و تعهدات کلیدی:</h4>
                        <ul className="space-y-2">
                          {currentDoc.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-stone-300 bg-stone-950/30 p-2.5 rounded-lg border border-stone-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
                        <span>این سند پایه تست‌های پذیرش و کدهای فاز بعد خواهد بود.</span>
                        <span className="text-amber-400/90 font-mono">SDD Version 1.0</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO RESTORATION DESK SIMULATION */}
        {activeTab === 'audiotest' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-amber-400" />
                  میز کار احیای نوار مغناطیسی ریواکس B77 (نمونه اولیه Web Audio DSP)
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  آزمایش ابزار فیلتر فرکانسی معماهای ۱ و ۲ (کالیبراسیون و تفکیک هوم موتور دیزل ققنوس روی باند سیزدهم).
                </p>
              </div>

              <button
                onClick={toggleAudioSimulation}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isPlayingAudio
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-900/30'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4" />
                    توقف پخش نوار
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    پخش آزمایشی نوار سیزدهم
                  </>
                )}
              </button>
            </div>

            {/* Tape Deck Hardware Visualizer */}
            <div className="rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 p-6 space-y-6 shadow-2xl">
              {/* Reels Area */}
              <div className="grid grid-cols-2 gap-8 items-center justify-center py-6 border-b border-stone-800">
                {/* Left Reel */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-36 h-36 rounded-full border-4 border-stone-700 bg-stone-900 flex items-center justify-center relative shadow-inner ${
                      isPlayingAudio ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: tapeSpeed === 'slow' ? '4s' : tapeSpeed === 'fast' ? '1s' : '2s' }}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-stone-600 bg-stone-800 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500/80" />
                    </div>
                    {/* Spoke marks */}
                    <div className="absolute w-full h-1 bg-stone-800/60" />
                    <div className="absolute h-full w-1 bg-stone-800/60" />
                  </div>
                  <span className="text-xs text-stone-400 font-mono">قرقره فرستنده (Supply Reel)</span>
                </div>

                {/* Right Reel */}
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-36 h-36 rounded-full border-4 border-stone-700 bg-stone-900 flex items-center justify-center relative shadow-inner ${
                      isPlayingAudio ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: tapeSpeed === 'slow' ? '4s' : tapeSpeed === 'fast' ? '1s' : '2s' }}
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-stone-600 bg-stone-800 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-amber-500/80" />
                    </div>
                    {/* Spoke marks */}
                    <div className="absolute w-full h-1 bg-stone-800/60" />
                    <div className="absolute h-full w-1 bg-stone-800/60" />
                  </div>
                  <span className="text-xs text-stone-400 font-mono">قرقره گیرنده (Take-up Reel)</span>
                </div>
              </div>

              {/* Audio Controls and Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* VU Meter */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-mono">VU METER (dB)</span>
                    <span className="text-amber-400 font-bold">{vuValue}%</span>
                  </div>
                  <div className="h-4 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${
                        vuValue > 80 ? 'bg-rose-500' : vuValue > 60 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${vuValue}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-stone-400 leading-relaxed">
                    نشانگر سطح سیگنال صوتی هد مغناطیسی ریواکس.
                  </div>
                </div>

                {/* Frequency Low-Pass Slider */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-mono">فیلتر پایین‌گذر (Low-Pass):</span>
                    <span className="text-amber-400 font-bold font-mono">{filterFrequency} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="10"
                    value={filterFrequency}
                    onChange={(e) => updateFilter(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[11px] text-stone-400 leading-relaxed">
                    حذف زوزه توفان و ایزوله‌سازی فرکانس ۴۰ هرتز ضربان موتور دیزل شناور.
                  </div>
                </div>

                {/* Tape Speed Selector */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="text-xs text-stone-400 font-mono">سرعت حرکت نوار (ips):</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['slow', 'standard', 'fast'] as const).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setTapeSpeed(spd);
                          if (oscRef.current && audioCtxRef.current) {
                            oscRef.current.frequency.setValueAtTime(
                              spd === 'slow' ? 220 : spd === 'fast' ? 880 : 440,
                              audioCtxRef.current.currentTime
                            );
                          }
                        }}
                        className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          tapeSpeed === spd
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {spd === 'slow' ? '3.75' : spd === 'standard' ? '7.5 (استاندارد)' : '15'}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-stone-400 leading-relaxed">
                    سرعت ضبط نوار سیزدهم: ۱۹ سانتی‌متر بر ثانیه (7.5 ips).
                  </div>
                </div>
              </div>

              {/* Dialogue Transcript Subtitle Preview */}
              <div className="p-4 rounded-xl bg-stone-900/90 border border-amber-500/20 text-center space-y-1">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  زیرنویس رمزگشایی‌شده از پیام اضطراری نوار ۱۳:
                </span>
                <p className="text-sm font-medium text-stone-200 italic">
                  {isPlayingAudio
                    ? '«...سهراب! بگو دانشیار بیاد پای بیسیم... انبار شماره ۲ آب گرفته... گارد ساحلی نباید بیاد! اون بسته‌ها...»'
                    : 'دستگاه متوقف است. برای شنیدن پیام روی «پخش آزمایشی نوار سیزدهم» کلیک کنید.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERSPECTIVE & FOOT-ANCHOR TESTING HARNESS */}
        {activeTab === 'perspective' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  آزمایشگاه هندسه صحنه و مهار پاشنه پا (Perspective & Foot Anchor)
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  شبیه‌سازی فرمول ADR-003 برای جلوگیری از شناور شدن پای آوا و تنظیم خودکار مقیاس با عمق صحنه.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-mono">
                <span className="text-stone-400">موقعیت Y:</span>
                <span className="text-amber-400 font-bold">{characterY}%</span>
                <span className="text-stone-600">|</span>
                <span className="text-stone-400">ضریب مقیاس:</span>
                <span className="text-emerald-400 font-bold">{calculatedScale}x</span>
              </div>
            </div>

            {/* Visual Stage Simulation Viewport (16:9 ratio) */}
            <div className="relative aspect-[16/9] w-full max-h-[500px] rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl select-none">
              {/* Layer 0: Background Vista (Misty Caspian Sea & Radio Tower) */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-stone-900 to-stone-950 opacity-90" />

              {/* Rain and Mist Ambient overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-black/80 pointer-events-none" />

              {/* Studio Window with sea view */}
              <div className="absolute top-6 left-12 right-12 h-36 rounded-xl border border-stone-800/80 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <div className="text-center space-y-1">
                  <div className="text-xs text-stone-400 font-mono">پنجره رو به امواج توفانی و فانوس دریایی صخره سیاه</div>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping mx-auto mt-2" />
                </div>
              </div>

              {/* Walkable Area Wireframe Polygon */}
              <div
                className="absolute inset-x-16 bottom-8 top-36 border border-dashed border-amber-500/30 bg-amber-500/5 rounded-xl flex items-start justify-center p-2 cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                  const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                  setCharacterX(Math.round(clickX));
                  // Map into 35% - 90% Y range
                  setCharacterY(Math.round(35 + (clickY / 100) * 55));
                }}
              >
                <span className="text-[11px] text-amber-400/60 font-mono">
                  [محدوده مجاز حرکت Walkable Polygon — کلیک برای جابجایی آوا]
                </span>
              </div>

              {/* Character Marker with Foot Anchor */}
              <div
                className="absolute transition-all duration-300 pointer-events-none"
                style={{
                  left: `${characterX}%`,
                  top: `${characterY}%`,
                  transform: `translate(-50%, -96%) scale(${calculatedScale})`,
                  transformOrigin: '50% 96%' // Rigorous Foot Anchor Standard
                }}
              >
                {/* Character Silhouette Representation */}
                <div className="relative flex flex-col items-center">
                  {/* Head & Scarf */}
                  <div className="w-8 h-8 rounded-full bg-stone-300 border border-stone-400 flex items-center justify-center shadow-md">
                    <div className="w-5 h-2 rounded-full bg-stone-600 mt-1" />
                  </div>
                  {/* Trench Coat Body */}
                  <div className="w-12 h-20 bg-stone-700 rounded-t-lg rounded-b-md border border-stone-600 flex flex-col items-center justify-between p-1 shadow-lg">
                    <span className="text-[9px] text-stone-300 font-bold mt-1">آوا</span>
                    {/* Headphone around neck */}
                    <div className="w-8 h-2 rounded-full bg-amber-500/80 mb-2" />
                  </div>
                  {/* Boots */}
                  <div className="flex gap-2">
                    <div className="w-3.5 h-4 bg-stone-900 rounded-b-sm border-b-2 border-amber-400" />
                    <div className="w-3.5 h-4 bg-stone-900 rounded-b-sm border-b-2 border-amber-400" />
                  </div>

                  {/* Contact Ground Shadow at Foot Anchor (ADR-003) */}
                  <div className="w-14 h-3 bg-black/60 rounded-full blur-[2px] mt-0.5" />
                </div>
              </div>

              {/* Live Coordinates Tooltip */}
              <div className="absolute bottom-3 left-4 text-xs font-mono text-stone-400 bg-stone-950/80 px-2.5 py-1 rounded border border-stone-800">
                مختصات لنگر پا: ({characterX}%, {characterY}%) • مقیاس: {calculatedScale}
              </div>
            </div>

            {/* Slider to manually adjust Y position */}
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">آزمایش دستی تغییر عمق کاراکتر (موقعیت عمودی Y):</span>
                <span className="text-amber-400 font-mono font-bold">{characterY}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="90"
                value={characterY}
                onChange={(e) => setCharacterY(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-xs text-stone-400 leading-relaxed">
                با حرکت اسلایدر مشاهده می‌کنید که چگونه آوا بدون جدا شدن پا از زمین، با عقب رفتن در صحنه کوچک‌تر و با نزدیک شدن بزرگ‌تر می‌شود؛ کاملاً منطبق بر پرسپکتیو سینمایی.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 px-4 py-3 text-center text-xs text-stone-400">
        فرکانس خاموش: پروندهٔ نوار سیزدهم • طراحی بر مبنای مشخصات (Spec-Driven Development) • نسخه مرحله صفر
      </footer>
    </div>
  );
}
