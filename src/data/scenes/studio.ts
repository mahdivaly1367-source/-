import type { Point } from "../../engine/navigation/perspective";

export type FacingDirection = "left" | "right" | "front" | "back";
export type HotspotKind = "examine" | "transition";
export type SceneId = "scene_exterior" | "scene_studio" | "scene_archive" | "scene_pier" | "scene_lighthouse" | "scene_homestead";
export type SceneAction = "station-door" | "power-junction" | "transmitter-panel" | "floor-hatch" | "bahman-confession" | "khosro-meeting" | "final-confrontation";

export interface SceneHotspot {
  id: string;
  label: string;
  title: string;
  description: string;
  kind: HotspotKind;
  polygon: readonly Point[];
  walkTarget: Point;
  facing: FacingDirection;
  clueId?: string;
  collectibleItemIds?: string[];
  targetSceneId?: SceneId;
  requiredItemId?: string;
  lockedMessage?: string;
  action?: SceneAction;
}

export interface SceneDefinition {
  id: string;
  title: string;
  subtitle: string;
  background: string;
  walkablePolygon: readonly Point[];
  spawnPoint: Point;
  perspective: {
    minY: number;
    maxY: number;
    minScale: number;
    maxScale: number;
  };
  hotspots: readonly SceneHotspot[];
}

export const STUDIO_SCENE: SceneDefinition = {
  id: "scene_studio",
  title: "اتاق پخش و استودیو",
  subtitle: "ایستگاه رادیویی ساحلی مه‌آب",
  background: "/assets/studio-background.svg",
  // Keep the walking polygon on the visible floor in front of the console.
  // The old y=64 edge placed Ava's feet on the console's front panel.
  walkablePolygon: [
    [13, 92],
    [23, 80],
    [29, 76],
    [36, 75],
    [67, 75],
    [76, 79],
    [90, 92],
  ],
  spawnPoint: [49, 88],
  perspective: {
    minY: 75,
    maxY: 90,
    minScale: 0.75,
    maxScale: 1.05,
  },
  hotspots: [
    {
      id: "archive-door",
      label: "درب راهروی آرشیو",
      title: "راهروی آرشیو",
      description:
        "پشت این در، راهروی باریکی به مخزن نوارها می‌رسد. قفل قدیمی هنوز باز است، اما چراغ راهرو سوخته. در این برش آزمایشی، این نقطه برای سنجش تعامل و تغییر نما نگه داشته شده است.",
      kind: "transition",
      targetSceneId: "scene_archive",
      polygon: [[3, 25], [15, 25], [15, 61], [3, 61]],
      walkTarget: [20, 76],
      facing: "left",
    },
    {
      id: "shift-board",
      label: "تخته اعلانات شیفت",
      title: "برنامهٔ کشیک ـ ۲۳ آبان ۱۳۷۸",
      description:
        "برگه‌های زردشدهٔ شیفت شب روی تخته با سنجاق‌های زنگ‌زده مانده‌اند. کنار ساعت ۲۲:۱۰، خطی با جوهر آبی دیده می‌شود که با نوشته‌های مشکی اطراف فرق دارد. این تفاوت ارزش ثبت دارد، اما به‌تنهایی جعل یا هویت نویسنده را ثابت نمی‌کند.",
      kind: "examine",
      clueId: "shift-log-2210",
      collectibleItemIds: ["shift-log-page"],
      polygon: [[24, 23], [44, 23], [44, 43], [24, 43]],
      walkTarget: [39, 69],
      facing: "left",
    },
    {
      id: "tape-deck",
      label: "دستگاه ضبط و پخش ریل",
      title: "ضبط‌صوت ریواکس B77",
      description:
        "دستگاه ریل‌به‌ریل روی میز پدر قرار دارد. گردوغبار روی کلیدها نشسته و چراغ نشانگر خاموش است. علت خاموشی هنوز معلوم نیست؛ فیوز و مسیر تغذیه باید بررسی شوند و پیش از تطبیق ولتاژ نباید دستگاه را روشن کرد.",
      kind: "examine",
      clueId: "tape-deck-unpowered",
      polygon: [[48, 37], [70, 37], [70, 58], [48, 58]],
      walkTarget: [58, 72],
      facing: "left",
    },
    {
      id: "tool-cabinet",
      label: "کمد ابزار الکترونیک",
      title: "کمد ابزار فلزی",
      description:
        "کمد خاکستری حاوی قطعات تعمیرات و کشوی فیوزهای یدکی است. پس از گشودن کشو، یک فیوز شیشه‌ای سالم ۲ آمپر میان قطعات پیدا می‌کنی. آن را بردار؛ نصبش به بررسی جداگانهٔ مدار و سلکتور ولتاژ نیاز دارد.",
      kind: "examine",
      collectibleItemIds: ["fuse-2a"],
      polygon: [[78, 31], [94, 31], [94, 63], [78, 63]],
      walkTarget: [75, 74],
      facing: "right",
    },
    {
      id: "sea-window",
      label: "پنجره رو به دریا",
      title: "پنجرهٔ مشرف به موج‌شکن",
      description:
        "قطره‌های باران شیشه را خط انداخته‌اند. از میان مه، نور فانوس دریایی صخرهٔ سیاه هر چند ثانیه یک‌بار پیدا و ناپدید می‌شود. باد به قاب پنجره فشار می‌آورد و صدای لرزش شیشه در اتاق می‌پیچد.",
      kind: "examine",
      polygon: [[54, 8], [89, 8], [89, 36], [54, 36]],
      walkTarget: [72, 64],
      facing: "right",
    },
    {
      id: "floor-rug",
      label: "فرش لاکی کنار میز",
      title: "فرش لاکی کهنه",
      description:
        "لبهٔ فرش کمی بالا آمده و رطوبت، چوب زیر آن را تیره کرده است. گوشهٔ نوارچسب قدیمی هم نامنظم است. فعلاً دریچه‌ای آشکار نشده؛ مشاهده را ثبت کن اما از آن نتیجهٔ قطعی نگیر.",
      kind: "examine",
      clueId: "floor-hatch-seam",
      action: "floor-hatch",
      polygon: [[43, 68], [65, 68], [65, 82], [43, 82]],
      walkTarget: [54, 88],
      facing: "front",
    },
    {
      id: "transmitter-panel",
      label: "تابلوی قطع فرستنده",
      title: "تابلوی برق فرستنده",
      description: "پیچ‌های قاب زنگ زده‌اند و پشت قاب، پایهٔ برنجی فیوز اصلی دیده می‌شود. اثر کشیدن ابزار روی فلز وجود دارد؛ برای باز کردن قاب باید از آچار مناسب استفاده شود.",
      kind: "examine",
      action: "transmitter-panel",
      polygon: [[72, 39], [83, 39], [83, 56], [72, 56]],
      walkTarget: [70, 74],
      facing: "right",
    },
    {
      id: "exterior-door",
      label: "درب بازگشت به محوطه",
      title: "درب ورودی ایستگاه",
      description: "از این در می‌توانی به محوطهٔ بیرونی برگردی؛ راه بازگشت همیشه در دسترس است.",
      kind: "transition",
      targetSceneId: "scene_exterior",
      polygon: [[2, 63], [15, 63], [15, 76], [2, 76]],
      walkTarget: [20, 78],
      facing: "left",
    },
  ],
};
