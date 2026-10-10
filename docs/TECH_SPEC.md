# مشخصات فنی و معماری نرم‌افزار (Technical Specification)
## «فرکانس خاموش: پروندهٔ نوار سیزدهم»
### اثر معمار ارشد سیستم‌ها و مهندس ارشد بازی

---

## ۱. فلسفه معماری و انتخاب فناوری

بازی بر پایه یک **موتور بازی دوبعدی ماجراجویی اعلانی و داده‌محور (Declarative Data-Driven 2D Adventure Engine)** ساخته می‌شود که روی بستر مدرن وب اجرا می‌گردد:
- **فریم‌ورک هسته:** React 19 + TypeScript (strict mode)
- **محیط توسعه و بیلد:** Vite 8.x (وابستگی فعلی `package.json`: `^8.3.0`) + Tailwind CSS v4
- **محرک انیمیشن و رندر رابط:** Motion + CSS Hardware-Accelerated Transforms
- **موتور صوتی بازی:** Web Audio API بومی (Native AudioContext) برای شبیه‌سازی دقیق فیلترهای فرکانسی، نویز نوار آنالوگ و تحلیلگر طیف صوتی بدون کتابخانه‌های سنگین خارجی.
- **معماری حالت (State Architecture):** تلفیق الگوی متمایز State Machine اعلانی با مخزن داده‌های تغییرناپذیر (Immutable Store) برای پشتیبانی کامل از ذخیره‌سازی فوری، بارگذاری و بازپخش وقایع.

---

## ۲. تفکیک مسئولیت‌ها و ساختار ماژولار (Subsystem Separation)

> **وضعیت این ساختار:** نمودار زیر معماری هدف فازهای بعد است، نه توصیف کامل فایل‌های اجرایی فعلی. در مخزن فعلی، فایل‌های کانونی عمدتاً `src/App.tsx`، `src/main.tsx` و `src/index.css` هستند؛ پوشه‌ها و ماژول‌های `engine/`، `data/`، `types/` و کامپوننت‌های فهرست‌شده هنوز به‌صورت موتور کامل بازی تحویل نشده‌اند.

```
src/
├── types/                 # تعریف قراردادها و تایپ‌های داده‌ای سیستم
│   ├── game.ts            # مدل کلی وضعیت، پرچم‌ها و پیشرفت
│   ├── scene.ts           # ساختار صحنه، هات‌اسپات‌ها و پلی‌گون‌های ناوبری
│   ├── dialogue.ts        # ساختار درخت دیالوگ و شروط
│   ├── puzzle.ts          # مدل داده‌ای معماها و ابزارهای صوتی
│   └── inventory.ts       # ساختار اقلام، بررسی و ترکیب
├── data/                  # محتوای بازی مستقل از منطق کُد (Data-Driven Content)
│   ├── scenes/            # تعریف اعلانی صحنه‌ها (استودیو، اسکله، فانوس و...)
│   ├── items.ts           # کاتالوگ تمام اشیای اینونتوری
│   ├── clues.ts           # بانک سرنخ‌ها و پیوندهای استنتاج
│   ├── dialogues/         # درخت‌های مکالمه با شخصیت‌ها
│   └── puzzles.ts         # تعاریف معماها و راهنماهای ۳ مرحله‌ای
├── engine/                # هسته اجرایی و موتور بازی
│   ├── state/             # مدیریت وضعیت بازی و ماندگاری داده
│   │   ├── gameState.ts   # هوک مرکزی و ردیاب پرچم‌ها
│   │   └── storage.ts     # ذخیره و بازیابی در LocalStorage با اعتبارسنجی
│   ├── audio/             # موتور صوتی و شبیه‌ساز نوار ریل و اکولایزر
│   │   ├── AudioManager.ts
│   │   └── TapeDSP.ts     # فیلترهای صوتی BiquadFilterNode و آنالیزگر فرکانس
│   ├── navigation/        # الگوریتم‌های پرسپکتیو، مقیاس عمق و مسیربندی
│   │   └── perspective.ts # محاسبه مقیاس بر اساس موقعیت Y و مهار پا (Foot Anchor)
├── components/            # کامپوننت‌های رندرینگ رابط کاربری و صحنه
│   ├── viewport/          # پنجره نمایش اصلی بازی (Viewport با نسبت ثابت ۱۶:۹)
│   │   ├── SceneRenderer.tsx
│   │   ├── CharacterSprite.tsx
│   │   ├── HotspotOverlay.tsx
│   │   └── AmbientFX.tsx
│   ├── ui/                # المان‌های تعاملی بازیکن
│   │   ├── InventoryBar.tsx
│   │   ├── ItemInspectionModal.tsx
│   │   ├── JournalModal.tsx
│   │   ├── DialogueOverlay.tsx
│   │   ├── AudioDeskModal.tsx
│   │   └── MainMenuModal.tsx
│   └── common/            # ادوات مشترک (دکمه، اسلایدر صوتی، زیرنویس)
└── App.tsx                # نقطه اتصال و مدیریت فریم
```

---

## ۳. قراردادهای داده‌ای و تایپ‌های کلیدی (Core Type Definitions)

### ۳.۱. مدل وضعیت سراسری بازی (`GameState`)
```typescript
export interface GameState {
  version: number;
  currentSceneId: string;
  previousSceneId: string | null;
  player: {
    x: number;          // درصد افقی در صحنه (۰ تا ۱۰۰)
    y: number;          // درصد عمودی در صحنه (۰ تا ۱۰۰ - نقطه تماس پا)
    direction: 'left' | 'right' | 'front' | 'back';
    isMoving: boolean;
  };
  inventory: string[];  // شناسه‌های اقلام موجود در کوله‌پشتی
  flags: Record<string, boolean | number | string>; // متغیرهای جریان داستان
  clues: string[];      // شناسه‌های سرنخ‌های کشف‌شده در دفترچه
  hypotheses: string[]; // استنتاج‌های تایید شده
  solvedPuzzles: string[]; // شناسه‌های معماهای حل‌شده
  inspectedItems: string[]; // اقلام بررسی شده
  activeDialogue: ActiveDialogueState | null;
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    subtitlesEnabled: boolean;
    highContrastHotspots: boolean;
  };
  playTimeSeconds: number;
  lastSaveTimestamp: number;
}
```

### ۳.۲. مشخصات صحنه و نقاط تعامل (`SceneDefinition`)
```typescript
export interface WalkableArea {
  polygon: [number, number][]; // چندضلعی ناحیه مجاز حرکت (درصد مختصات ۰ تا ۱۰۰)
  minY: number;                // عمق‌ترین نقطه صحنه (دورترین نقطه)
  maxY: number;                // نزدیک‌ترین نقطه به لنز دوربین
  scaleAtMinY: number;         // مقیاس کاراکتر در minY (مثلاً ۰.۷۵)
  scaleAtMaxY: number;         // مقیاس کاراکتر در maxY (مثلاً ۱.۰۵)
}

export type HotspotActionType = 'look' | 'interact' | 'talk' | 'transition' | 'use_item';

export interface Hotspot {
  id: string;
  name: string;                // نام فارسی که هنگام هاور نشان داده می‌شود
  cursor: 'examine' | 'interact' | 'talk' | 'exit' | 'gear';
  polygon: [number, number][]; // محدوده هندسی هاور و کلیک
  walkTarget: [number, number];// نقطه‌ای که کاراکتر قبل از تعامل باید به آن برود
  facingDirection: 'left' | 'right' | 'front' | 'back';
  condition?: (state: GameState) => boolean;
  onExamine: (dispatch: GameDispatch) => void;
  onInteract?: (dispatch: GameDispatch) => void;
  onUseItem?: (itemId: string, dispatch: GameDispatch) => boolean;
}

export interface SceneDefinition {
  id: string;
  title: string;
  backgroundImage: string;
  foregroundImage?: string;
  ambientSound: string;
  musicTrack?: string;
  walkableArea: WalkableArea;
  spawnPoints: Record<string, [number, number]>;
  hotspots: Hotspot[];
  lightingMood: 'gloomy_rain' | 'warm_indoor' | 'flicker_archive' | 'foggy_pier' | 'foggy_lighthouse' | 'warm_homestead' | 'storm_night';
}
```

### ۳.۳. ساختار درختی دیالوگ‌ها (`DialogueTree`)
```typescript
export interface DialogueOption {
  id: string;
  text: string;
  condition?: (state: GameState) => boolean;
  nextDialogueId?: string;
  action?: (dispatch: GameDispatch) => void;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle: string;
  text: string;
  voiceAudioKey?: string;
  options: DialogueOption[];
}
```

---

## ۴. موتور صوتی و پردازش سیگنال (DSP Audio Engine)
برای اجرای معماهای صوتی و احیای نوار سیزدهم، سیستم `Web Audio API` در فاز پیاده‌سازی ساخته و آزمایش خواهد شد. در مرحلهٔ صفر، این بخش فقط مشخص شده و هنوز موتور صوتی کامل و تأییدشده محسوب نمی‌شود:
- **نود سورس نوار (`AudioBufferSourceNode`):** قابلیت تغییر سرعت (`playbackRate`) از ۰.۵x تا ۲.۰x برای شبیه‌سازی تغییر دور موتور ضبط‌صوت.
- **زنجیره فیلترها (`BiquadFilterNode`):**
  - فیلتر بالاگذر (High-Pass) برای حذف غرَمبش امواج زیر ۳۰ هرتز.
  - فیلتر پایین‌گذر (Low-Pass) متغیر برای حذف سوت باران و باد بالای ۳۰۰ تا ۲۰۰۰ هرتز.
  - فیلتر شیارگیر (Notch Filter) روی ۵۰ هرتز برای حذف هام جریان برق متناوب.
- **آنالیزور زمان‌واقعی (`AnalyserNode`):** استخراج طیف فرکانسی و نمایشگر زنده FFT در رابط کاربری دستگاه ضبط تا بازیکن بازخورد بصری موج صدا را مشاهده کند.

---

## ۵. ماندگاری داده‌ها و ذخیره‌سازی (Save/Load Subsystem)
- **فضای ذخیره:** `window.localStorage` با کلید `silent_freq_tape13_save_slot_1` و کلید ذخیره خودکار `silent_freq_autosave`.
- **مکانیسم اعتبارسنجی:** مقایسهٔ فیلد `version` در دادهٔ ذخیره‌شده، اعتبارسنجی فیلدها و ادغام با مقادیر پیش‌فرض پس از ارتقای نسخه. اگر داده خراب باشد، بازی باید به وضعیت امن بازگردد؛ خطاهای `localStorage` نیز باید مدیریت شوند. در صورت غیرفعال یا پر بودن فضای ذخیره‌سازی، ادامهٔ همان نشست در حافظه ممکن است اما دوام پیشرفت تضمین نمی‌شود.
- **پشتیبانی از حالت بازنشانی (New Game / Reset):** امکان پاکسازی ذخیره و شروع ماجراجویی از نقطه صفر با هشدار تأییدیه کاربر.

---

## ۶. جعبه ابزار توسعه و دیباگ (Dev & QA Harness)
سیستم شامل یک پنل مخفی توسعه‌دهنده (تسهیل تست برای داوران و آزمون‌گران با کلید `Ctrl+Shift+D` یا دکمه دیباگ غیرفعال در پروداکشن) است که امکانات زیر را فراهم می‌کند:
- پرش آنی به هر یک از صحنه‌ها (Scene Teleportation).
- باز کردن سریع تمامی آیتم‌های اینونتوری برای اعتبارسنجی پازل‌ها.
- تغییر پرچم‌های داستان (Story Flag Toggles).
- نمایش پلی‌گون‌های مرئی نواحی مجاز حرکت و هات‌اسپات‌ها (Debug Mesh Overlay).
