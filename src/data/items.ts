import { AudioLines, Zap, Wrench, Scissors, FileText, Cable, KeyRound, AudioWaveform, ScrollText, ClipboardList, Radio, Camera, BookOpen } from "lucide-react";
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

  "insulated-cutters": {
    id:"insulated-cutters", title:"سیم‌چین عایق‌دار", shortName:"سیم‌چین", kind:"electrical",
    description:"سیم‌چین کهنه با دسته‌های عایق؛ برای بریدن زنجیر باریک در ورودی ایستگاه.",
    inspection:"عایق دسته ترک ریز دارد اما سالم است. ابزار باید فقط برای بازکردن زنجیر فرسوده استفاده شود؛ هیچ سیم برقی را با آن دستکاری نکن.",
    catalogueMark:"INSULATED CUTTERS", icon:Scissors,
  },
  "rusty-wrench": {
    id:"rusty-wrench", title:"آچار فرانسه فرسوده", shortName:"آچار", kind:"electrical",
    description:"آچار فرانسه‌ای زنگ‌زده در جعبه ابزار کنار بولدوزر شهرداری.",
    inspection:"روی فک‌های آچار لکه‌ای از رنگ سبز تیره دیده می‌شود. اندازه‌اش برای بازکردن پیچ‌های قاب تابلوی برق ایستگاه مناسب است.",
    catalogueMark:"ADJUSTABLE WRENCH", icon:Wrench,
  },
  "shift-log-page": {
    id:"shift-log-page", title:"برگهٔ ثبت کشیک اصلاح‌شده", shortName:"برگهٔ کشیک", kind:"document",
    description:"نسخه‌ای از صفحهٔ شیفت ۲۳ آبان با خط‌خوردگی و لکهٔ جوهر آبی کنار ساعت ۲۲:۱۰.",
    inspection:"برگه را جدا نمی‌کنم؛ از آن عکس و یادداشت دقیق می‌گیرم. تغییر جوهر مدرک بررسی بیشتر است، نه اثبات خودکار جعل.",
    catalogueMark:"SHIFT LOG · 23 ABAN 78", icon:ClipboardList, revealsClueId:"shift-log-correction",
  },
  "fuse-tamper-evidence": {
    id:"fuse-tamper-evidence", title:"فیوز دست‌کاری‌شدهٔ فرستنده", shortName:"فیوز مدرک", kind:"electrical",
    description:"فیوز بیرون‌آمده از تابلوی فرستنده؛ رشتهٔ داخل آن سالم است اما روی پایه اثر ابزار دیده می‌شود.",
    inspection:"رشته نسوخته و روی پایهٔ برنجی خط‌های باریک کشیدگی ابزار دیده می‌شود. این با قطع طبیعی فیوز سازگار نیست، اما ابزار و زنجیرهٔ نگهداری مدرک باید مستقل بررسی شوند.",
    catalogueMark:"TRANSMITTER FUSE · EVIDENCE", icon:Zap, revealsClueId:"tampered-fuse-marks",
  },
  "bahman-pliers": {
    id:"bahman-pliers", title:"انبردست بهمن", shortName:"انبردست", kind:"electrical",
    description:"انبردست فرسوده روی میز کار بهمن با فک‌های دندانه‌دار و رد فلز برنجی.",
    inspection:"الگوی دندانه‌ها با خط‌های روی پایهٔ فیوز شباهت اولیه دارد. شباهت ابزار به‌تنهایی ثابت نمی‌کند چه کسی یا چه زمانی آن را به کار برده؛ بهمن باید درباره‌اش پاسخ بدهد.",
    catalogueMark:"BAHMAN · PLIERS", icon:Wrench, revealsClueId:"bahman-tool-marks",
  },
  "lighthouse-key": {
    id:"lighthouse-key", title:"کلید فانوس دریایی", shortName:"کلید فانوس", kind:"electrical",
    description:"کلید برنجی قدیمی که بهمن پس از ارائهٔ مدارک به آوا می‌دهد.",
    inspection:"روی سر کلید حرف «خ» حک شده است. کلید برای در چوبی برج صخرهٔ سیاه به کار می‌رود؛ آن را مصرف نکن.",
    catalogueMark:"BLACK ROCK LIGHTHOUSE", icon:KeyRound,
  },
  "tuning-fork-440": {
    id:"tuning-fork-440", title:"دیاپازون نقره‌ای سهراب", shortName:"دیاپازون ۴۴۰", kind:"electrical",
    description:"دیاپازون فولادی-نقره‌ای با حک «نغمهٔ مادر: لا، ۴۴۰ هرتز». خسرو آن را به آوا می‌سپارد.",
    inspection:"با ضربهٔ کنترل‌شده فرکانس اسمی ۴۴۰ هرتز ایجاد می‌شود. در این نمونه، فعال‌کردن آن برای شیار تشدید دریچه شبیه‌سازی شده؛ فرکانس صوتی است، نه موج رادیویی.",
    catalogueMark:"A · 440 Hz", icon:AudioWaveform, revealsClueId:"fork-note-440",
  },
  "vintage-photo": {
    id:"vintage-photo", title:"عکس افتتاحیهٔ ایستگاه", shortName:"عکس افتتاحیه", kind:"document",
    description:"عکس سیاه‌وسفید سهراب در شب افتتاحیه؛ روی تابلوی پشت سر او عدد ۱۳۵۹ کیلوهرتز دیده می‌شود.",
    inspection:"عدد ۱۳۵۹ به فرکانس پخش شب افتتاحیه مربوط است. یادداشت فنی کنار رادیوی خانه توضیح می‌دهد که سهراب این عدد را برای قفل‌های شخصی انتخاب می‌کرد.",
    catalogueMark:"MAH-ABAN · OPENING DAY", icon:Camera, revealsClueId:"opening-photo-1359",
  },
  "frequency-note-1359": {
    id:"frequency-note-1359", title:"یادداشت فرکانس خانهٔ راد", shortName:"یادداشت ۱۳۵۹", kind:"document",
    description:"یادداشت فنی پشت رادیوی لامپی دربارهٔ موج افتتاحیهٔ رادیو مه‌آب.",
    inspection:"سهراب نوشته است: «۱۳۵۹ کیلوهرتز، موج افتتاحیه؛ عددی که برای قفل‌های شخصی‌ام نگه می‌دارم.» این قرینه همراه عکس، رمز دریچه را توجیه می‌کند.",
    catalogueMark:"1359 kHz · HOME RADIO", icon:Radio, revealsClueId:"frequency-note-1359",
  },
  "poetry-book": {
    id:"poetry-book", title:"دفترچه شعر سهراب", shortName:"دفترچه شعر", kind:"document",
    description:"دفترچه‌ای کوچک از شعرها و یادداشت‌های کنار امواج دریا.",
    inspection:"در حاشیه نوشته شده: «کلید دوم را با نغمهٔ لا بیدار کن.» این عبارت به دیاپازون ۴۴۰ هرتز و شیار تشدید دریچه اشاره دارد.",
    catalogueMark:"SOHRAB · NOTES", icon:BookOpen, revealsClueId:"fork-note-440",
  },
  "official-tape-12": {
    id:"official-tape-12", title:"نوار رسمی شمارهٔ ۱۲", shortName:"نوار ۱۲", kind:"tape",
    description:"نسخهٔ بایگانی‌شده‌ای که در پروندهٔ قدیمی به هیئت تحقیق ارائه شده بود.",
    inspection:"این نوار به‌تنهایی برای تطبیق کافی نیست؛ برچسب آرشیو و دفتر تحویل مدارک هم باید بررسی شود.",
    catalogueMark:"ARCHIVE · TAPE 12", icon:AudioLines, revealsClueId:"archive-tape-12",
  },
  "fisheries-catalog": {
    id:"fisheries-catalog", title:"کاتالوگ فنی موتورهای شیلات", shortName:"کاتالوگ", kind:"document",
    description:"جدول محدودهٔ فرکانسی موتورهای متداول شناورهای شمال.",
    inspection:"محدودهٔ یانمار دیزل ۳۵ تا ۴۵ هرتز و یاماها بنزینی ۱۲۰ تا ۱۵۰ هرتز در سند ثبت شده است. این جدول برای تطبیق فنی است، نه شناسایی قطعی یک کشتی.",
    catalogueMark:"FISHERIES · ENGINE CATALOG", icon:ScrollText, revealsClueId:"yanmar-catalog",
  },
  "sohrab-letter": {
    id:"sohrab-letter", title:"نامهٔ سهراب به آوا", shortName:"نامهٔ پدر", kind:"document",
    description:"نامه‌ای تاخورده با تاریخ ۲۴ آبان ۱۳۷۸ که داخل محفظهٔ زیر کف پنهان بوده است.",
    inspection:"«آوای عزیزم، حقیقت در برابر امواج گم نمی‌شود؛ تنها در انتظار گوشی شنوا می‌ماند.» نامه زمینهٔ سرنوشت پدر را روشن می‌کند، اما به‌تنهایی همهٔ جزئیات واقعه را ثابت نمی‌کند.",
    catalogueMark:"SOHRAB · 24 ABAN 78", icon:FileText, revealsClueId:"sohrab-letter",
  },
  "master-tape-13": {
    id:"master-tape-13", title:"نوار مستر سیزدهم", shortName:"مستر ۱۳", kind:"tape",
    description:"نسخهٔ مرجع کامل و دست‌نخوردهٔ نوار سیزدهم که در محفظهٔ ضدحریق زیر کف پنهان شده بود.",
    inspection:"این نسخه برای بررسی مستقل حفظ می‌شود. پیش از هر نتیجهٔ قطعی باید اصالت، زنجیرهٔ نگهداری و نسخه‌های دیگر با کارشناس مستقل تطبیق داده شود.",
    catalogueMark:"MASTER · TAPE 13", icon:AudioLines, revealsClueId:"master-tape-recovered",
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
