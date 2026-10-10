import { FileText, AudioLines, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface InventoryItem {
  id: string;
  title: string;
  shortName: string;
  kind: "document" | "tape" | "electrical";
  description: string;
  inspection: string;
  catalogueMark: string;
  icon: LucideIcon;
  revealsClueId?: string;
}

export const ITEMS: Record<string, InventoryItem> = {
  "tape-13": {
    id: "tape-13",
    title: "نوار ریل سیزدهم",
    shortName: "نوار ۱۳",
    kind: "tape",
    description: "یک حلقهٔ نوار مغناطیسی با برچسب کاغذی کهنه؛ نسخهٔ کوتاهی است که خسرو برای آغاز تحقیق به آوا رسانده.",
    inspection: "پشت برچسب با مداد نوشته شده: «۱۹ cm/s · CCIR · مرجع سوت پایلوت ۱۰۰۰ هرتز». این نوشته فقط مشخصات ضبط را نشان می‌دهد؛ زمان وقوع یا هویت فردی را به‌تنهایی ثابت نمی‌کند.",
    catalogueMark: "REVOX · 19 cm/s",
    icon: AudioLines,
    revealsClueId: "tape13-label",
  },
  "fuse-2a": {
    id: "fuse-2a",
    title: "فیوز یدکی ۲ آمپر",
    shortName: "فیوز ۲A",
    kind: "electrical",
    description: "فیوز شیشه‌ای سالم از کشوی کمد ابزار استودیو، با درپوش‌های فلزی و رشتهٔ داخلی سالم.",
    inspection: "رشتهٔ فلزی داخل شیشه سالم است و شیشه نشانه‌ای از سوختگی ندارد. هنوز نباید آن را نصب کرد: ولتاژ و مسیر تغذیهٔ دستگاه باید جداگانه بررسی شود.",
    catalogueMark: "GLASS FUSE · 2A",
    icon: Zap,
  },
};

export function getInventoryItem(itemId: string): InventoryItem | undefined {
  return ITEMS[itemId];
}
