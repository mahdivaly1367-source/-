import type { Point } from "../../engine/navigation/perspective";

export type FacingDirection = "left" | "right" | "front" | "back";
export type HotspotKind = "examine" | "transition";

export interface SceneHotspot {
  id: string;
  label: string;
  title: string;
  description: string;
  kind: HotspotKind;
  polygon: readonly Point[];
  walkTarget: Point;
  facing: FacingDirection;
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
  walkablePolygon: [
    [13, 92],
    [26, 70],
    [36, 64],
    [67, 64],
    [79, 71],
    [90, 92],
  ],
  spawnPoint: [49, 88],
  perspective: {
    minY: 35,
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
      polygon: [[3, 25], [15, 25], [15, 61], [3, 61]],
      walkTarget: [20, 76],
      facing: "left",
    },
    {
      id: "shift-board",
      label: "تخته اعلانات شیفت",
      title: "برنامهٔ کشیک ـ ۲۳ آبان ۱۳۷۸",
      description:
        "برگه‌های زردشدهٔ شیفت شب روی تخته با سنجاق‌های زنگ‌زده مانده‌اند. کنار ساعت ۲۲:۱۰، خطی با جوهر آبی دیده می‌شود که با نوشته‌های مشکی سهراب فرق دارد. فعلاً می‌توان این مدرک را بررسی کرد؛ ثبت دائمی سرنخ در دفترچه در مرحلهٔ بعد اضافه می‌شود.",
      kind: "examine",
      polygon: [[24, 23], [44, 23], [44, 43], [24, 43]],
      walkTarget: [39, 69],
      facing: "left",
    },
    {
      id: "tape-deck",
      label: "دستگاه ضبط و پخش ریل",
      title: "ضبط‌صوت ریواکس B77",
      description:
        "دستگاه ریل‌به‌ریل روی میز پدر قرار دارد. گردوغبار روی کلیدها نشسته و چراغ نشانگر خاموش است. این نما در فاز نخست برای آزمایش نزدیک شدن، جهت‌گیری و باز کردن نمای بررسی استفاده می‌شود؛ منطق کامل راه‌اندازی نوار هنوز در دامنهٔ این فاز نیست.",
      kind: "examine",
      polygon: [[48, 37], [70, 37], [70, 58], [48, 58]],
      walkTarget: [58, 72],
      facing: "left",
    },
    {
      id: "tool-cabinet",
      label: "کمد ابزار الکترونیک",
      title: "کمد ابزار فلزی",
      description:
        "کمد خاکستری حاوی قطعات تعمیرات و کشوی فیوزهای یدکی است. روی دستگیره، جای انگشت‌ها در لایه‌ای از گردوغبار باقی مانده. جمع‌آوری و مصرف واقعی ابزارها در مرحلهٔ Inventory پیاده‌سازی می‌شود.",
      kind: "examine",
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
        "لبهٔ فرش کمی بالا آمده و رطوبت، چوب زیر آن را تیره کرده است. هنوز برای آشکار کردن دریچه نباید آن را کنار زد؛ ابتدا باید فضای اتاق و ابزارهای روی میز را بررسی کنی.",
      kind: "examine",
      polygon: [[43, 68], [65, 68], [65, 82], [43, 82]],
      walkTarget: [54, 88],
      facing: "front",
    },
  ],
};
