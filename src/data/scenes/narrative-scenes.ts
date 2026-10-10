import type { SceneDefinition } from "./studio";

export const EXTERIOR_SCENE: SceneDefinition = {
 id:"scene_exterior", title:"محوطهٔ بیرونی ایستگاه", subtitle:"بندر مه‌آب · ۷۲ ساعت تا تخریب",
 background:"/assets/exterior-background.svg",
 walkablePolygon:[[5,94],[12,78],[24,72],[77,72],[91,82],[97,94]],
 spawnPoint:[28,88], perspective:{minY:72,maxY:94,minScale:.76,maxScale:1.08},
 hotspots:[
  {id:"toolbox",label:"جعبه‌ابزار کنار بولدوزر",title:"جعبه‌ابزار پیمانکار",description:"پشت چرخ بولدوزر، جعبه‌ای خیس با آچار و سیم‌چین عایق‌دار مانده است. ابزارها را بردار؛ برای ورود به ایستگاه به سیم‌چین نیاز داری.",kind:"examine",collectibleItemIds:["insulated-cutters","rusty-wrench"],polygon:[[66,44],[81,44],[81,60],[66,60]],walkTarget:[65,76],facing:"left"},
  {id:"demolition-notice",label:"اعلامیهٔ تخریب",title:"اخطار رسمی تخریب",description:"مهلت تخریب تا دو روز دیگر است. تاریخ مصوبه فقط دو هفته پس از مجوز ساخت هتل شرکت دانشیار صادر شده؛ این هم‌زمانی ثبت می‌شود اما به‌تنهایی قصد پنهان‌کاری را ثابت نمی‌کند.",kind:"examine",clueId:"demolition-permit-timing",polygon:[[31,26],[43,26],[43,47],[31,47]],walkTarget:[34,72],facing:"left"},
  {id:"station-door",label:"درب زنجیرشدهٔ ایستگاه",title:"درب ورودی ایستگاه",description:"زنجیر زنگ‌زده هنوز دور دستگیره است. برای بریدن آن، سیم‌چین عایق‌دار لازم است. استفاده از ابزار روی همین هات‌اسپات در را باز می‌کند.",kind:"transition",action:"station-door",requiredItemId:"insulated-cutters",lockedMessage:"زنجیر با دست باز نمی‌شود؛ جعبه‌ابزار کنار بولدوزر را بگرد و سیم‌چین را روی در استفاده کن.",targetSceneId:"scene_studio",polygon:[[45,26],[62,26],[62,66],[45,66]],walkTarget:[52,77],facing:"front"},
  {id:"coast-route",label:"مسیر عمومی به اسکله",title:"مسیر عمومی ساحل",description:"راه باریک کنار دیوار به اسکلهٔ صیادی می‌رود. از این مسیر می‌توانی به ساحل برگردی؛ راه ورود به فانوس جداگانه به کلید نیاز دارد.",kind:"transition",targetSceneId:"scene_pier",polygon:[[81,62],[98,62],[98,89],[83,83]],walkTarget:[86,85],facing:"right"},
  {id:"final-confrontation",label:"مواجهه با قاسم دانشیار",title:"ورود دانشیار به محوطهٔ تخریب",description:"دانشیار برای نظارت بر تخریب آمده است. تا وقتی نوار مستر و نامه پیدا نشده، اتهام قطعی مطرح نمی‌شود؛ پس از یافتن شواهد می‌توان آن‌ها را به مرجع مستقل سپرد.",kind:"examine",action:"final-confrontation",polygon:[[3,30],[18,30],[18,65],[3,65]],walkTarget:[23,76],facing:"left"}
 ]
};

export const ARCHIVE_SCENE: SceneDefinition = {
 id:"scene_archive", title:"مخزن آرشیو نوارها", subtitle:"آرشیو رسمی · آبان ۱۳۷۸",
 background:"/assets/archive-background.svg", walkablePolygon:[[8,93],[17,78],[26,74],[76,74],[88,82],[95,93]], spawnPoint:[34,87],
 perspective:{minY:74,maxY:93,minScale:.76,maxScale:1.08},
 hotspots:[
  {id:"tape-shelf",label:"قفسهٔ نوارهای آبان",title:"قفسهٔ نوارهای آبان ۱۳۷۸",description:"جعبه‌های شمارهٔ ۱ تا ۱۲ ردیف شده‌اند، اما جای شمارهٔ ۱۳ خالی است و خاک اطراف آن کمتر است. این جای خالی را ثبت کن.",kind:"examine",clueId:"archive-tape-gap",polygon:[[14,19],[42,19],[42,62],[14,62]],walkTarget:[33,73],facing:"left"},
  {id:"official-tape",label:"جعبهٔ نوار رسمی ۱۲",title:"نوار رسمی شمارهٔ ۱۲",description:"این نسخه در پروندهٔ قدیمی ارائه شده است. آن را برای مقایسه بردار؛ خود نوار مصرف نمی‌شود.",kind:"examine",collectibleItemIds:["official-tape-12"],polygon:[[47,32],[60,32],[60,48],[47,48]],walkTarget:[48,73],facing:"right"},
  {id:"fisheries-catalog",label:"کاتالوگ موتورهای شیلات",title:"مرجع فنی موتورهای بنادر شمال",description:"جدول محدودهٔ فرکانسی موتورهای شیلات را بردار و با قلهٔ آزمایشی نزدیک ۴۰ هرتز تطبیق بده. این جدول به‌تنهایی شناور را شناسایی نمی‌کند.",kind:"examine",collectibleItemIds:["fisheries-catalog"],clueId:"yanmar-catalog",polygon:[[67,25],[84,25],[84,51],[67,51]],walkTarget:[70,73],facing:"right"},
  {id:"archive-ledger",label:"دفتر ثبت تحویل آرشیو",title:"دفتر ثبت تحویل مدارک",description:"امضای دانشیار در دفتر تحویل نسخه‌های رسمی دیده می‌شود. امضا مسیر اداری مدرک را نشان می‌دهد اما به‌تنهایی دستکاری را ثابت نمی‌کند.",kind:"examine",clueId:"archive-ledger-signature",polygon:[[45,53],[61,53],[61,66],[45,66]],walkTarget:[51,76],facing:"front"},
  {id:"archive-exit",label:"بازگشت به استودیو",title:"درب بازگشت به استودیو",description:"راه باریک به اتاق پخش برمی‌گردد. می‌توانی بعداً دوباره به آرشیو سر بزنی.",kind:"transition",targetSceneId:"scene_studio",polygon:[[2,40],[11,40],[11,68],[2,68]],walkTarget:[18,78],facing:"left"}
 ]
};

export const PIER_SCENE: SceneDefinition = {
 id:"scene_pier",title:"اسکله و کارگاه رادیو",subtitle:"اسکلهٔ صیادی · محل کار بهمن شریفی",
 background:"/assets/pier-background.svg",walkablePolygon:[[3,93],[10,78],[28,73],[72,73],[90,80],[98,93]],spawnPoint:[22,87],
 perspective:{minY:73,maxY:93,minScale:.76,maxScale:1.08},
 hotspots:[
  {id:"bahman-workbench",label:"میز کار بهمن",title:"کارگاه تعمیر رادیو بهمن",description:"انبردستی فرسوده روی میز است. آن را بررسی کن و سپس با مدارک مربوط به فیوز و برگهٔ کشیک دربارهٔ شب توفان از بهمن سؤال کن. پاسخ اشتباه گفت‌وگو را برای همیشه قفل نمی‌کند.",kind:"examine",action:"bahman-confession",collectibleItemIds:["bahman-pliers"],polygon:[[39,32],[65,32],[65,57],[39,57]],walkTarget:[46,73],facing:"left"},
  {id:"pervane",label:"میز و دفتر پروانه برخوردار",title:"پروانه برخوردار",description:"پروانه سال‌ها سهراب را مقصر می‌دانست. پس از ثبت شواهد دستکاری و دیدن اختلاف گزارش‌ها حاضر است دفترچهٔ ناخدا را برای مقایسه در اختیار آوا بگذارد.",kind:"examine",clueId:"captain-logbook-support",collectibleItemIds:["captain-logbook"],polygon:[[69,29],[86,29],[86,53],[69,53]],walkTarget:[68,74],facing:"right"},
  {id:"homestead-route",label:"مسیر فرعی خانهٔ راد",title:"راه خانهٔ قدیمی راد",description:"از کوچهٔ پشت اسکله می‌توانی به خانهٔ قدیمی خانوادهٔ راد بروی؛ عکس افتتاحیه و یادداشت فرکانسی در آنجا هستند.",kind:"transition",targetSceneId:"scene_homestead",polygon:[[5,23],[17,23],[17,52],[5,52]],walkTarget:[17,75],facing:"left"},
  {id:"lighthouse-door",label:"مسیر فانوس دریایی",title:"در ورودی فانوس صخرهٔ سیاه",description:"در چوبی برج قفل است. کلید آن را باید از بهمن، پس از ارائهٔ شواهد کافی، بگیری. راه بازگشت به اسکله همچنان باز است.",kind:"transition",targetSceneId:"scene_lighthouse",requiredItemId:"lighthouse-key",lockedMessage:"خسرو پشت در است، اما بدون کلید فانوس نمی‌توانی وارد شوی. ابتدا دربارهٔ شب توفان با بهمن صحبت کن.",polygon:[[82,28],[97,28],[97,68],[82,68]],walkTarget:[82,75],facing:"right"},
  {id:"pier-exit",label:"بازگشت به محوطهٔ بیرونی",title:"راه بازگشت به محوطه",description:"مسیر عمومی ساحل به محوطهٔ ایستگاه می‌رسد. این خروجی همیشه باز است.",kind:"transition",targetSceneId:"scene_exterior",polygon:[[21,60],[32,60],[32,75],[21,75]],walkTarget:[28,77],facing:"left"}
 ]
};

export const LIGHTHOUSE_SCENE: SceneDefinition = {
 id:"scene_lighthouse",title:"فانوس دریایی صخرهٔ سیاه",subtitle:"برج ساحلی · دیدار با خسرو پیرنیا",
 background:"/assets/lighthouse-background.svg",walkablePolygon:[[15,93],[23,80],[31,75],[68,75],[80,82],[87,93]],spawnPoint:[26,88],
 perspective:{minY:75,maxY:93,minScale:.76,maxScale:1.07},
 hotspots:[
  {id:"khosro-table",label:"میز گرد خسرو",title:"میز و نقشهٔ خسرو",description:"خسرو نقشهٔ دریایی و قطب‌نما را کنار پیپ گذاشته است. پس از گفت‌وگو، او سرنوشت سهراب را شرح می‌دهد و دیاپازون نقره‌ای را به آوا می‌سپارد.",kind:"examine",action:"khosro-meeting",clueId:"khosro-fate",polygon:[[43,39],[67,39],[67,59],[43,59]],walkTarget:[48,74],facing:"right"},
  {id:"fresnel-lens",label:"لنز فرسنل فانوس",title:"لنز فرسنل و افق دریا",description:"از میان منشورهای شیشه‌ای، در جزر می‌توان خط تیرهٔ لاشهٔ ققنوس را روی صخره دید. این مشاهده مسیر بررسی را تقویت می‌کند اما هویت محموله را ثابت نمی‌کند.",kind:"examine",clueId:"lighthouse-wreck-sighting",polygon:[[31,8],[68,8],[68,36],[31,36]],walkTarget:[52,72],facing:"back"},
  {id:"lighthouse-exit",label:"بازگشت به اسکله",title:"پلکان و در فانوس",description:"راه برگشت از پلکان باریک به اسکله باز است؛ گرفتن دیاپازون وضعیت در را تغییر نمی‌دهد.",kind:"transition",targetSceneId:"scene_pier",polygon:[[3,55],[17,55],[17,78],[3,78]],walkTarget:[24,79],facing:"left"}
 ]
};

export const HOMESTEAD_SCENE: SceneDefinition = {
 id:"scene_homestead",title:"خانهٔ قدیمی خانوادهٔ راد",subtitle:"خانهٔ چوبی نم‌کشیده · یادگارهای سهراب",
 background:"/assets/homestead-background.svg",walkablePolygon:[[7,93],[16,80],[28,75],[72,75],[86,82],[94,93]],spawnPoint:[27,88],
 perspective:{minY:75,maxY:93,minScale:.76,maxScale:1.07},
 hotspots:[
  {id:"framed-photo",label:"قاب عکس افتتاحیه",title:"عکس افتتاحیهٔ رادیو مه‌آب",description:"سهراب جلوی تابلوی فرکانس افتتاحیه ایستاده است. عدد ۱۳۵۹ کیلوهرتز روی تابلو دیده می‌شود؛ یادداشت فنی رادیو را هم پیدا کن تا بدانی پدر از این عدد برای قفل‌ها استفاده می‌کرد.",kind:"examine",clueId:"opening-photo-1359",collectibleItemIds:["vintage-photo"],polygon:[[28,22],[46,22],[46,42],[28,42]],walkTarget:[37,74],facing:"left"},
  {id:"tube-radio",label:"رادیوی لامپی و یادداشت فنی",title:"رادیوی لامپی سهراب",description:"پشت رادیو یادداشتی است: «۱۳۵۹ کیلوهرتز، موج افتتاحیه؛ عدد قفل‌های شخصی من». این مدرک در کنار عکس، رمز دریچه را توجیه می‌کند.",kind:"examine",clueId:"frequency-note-1359",collectibleItemIds:["frequency-note-1359"],polygon:[[54,35],[73,35],[73,55],[54,55]],walkTarget:[65,74],facing:"right"},
  {id:"poetry-book",label:"دفترچه شعر سهراب",title:"دفترچهٔ شعر و دست‌نوشته‌ها",description:"حاشیهٔ یکی از شعرها می‌گوید: «کلید دوم را با نغمهٔ لا بیدار کن». این اشاره با دیاپازون ۴۴۰ هرتز پیوند دارد.",kind:"examine",clueId:"fork-note-440",collectibleItemIds:["poetry-book"],polygon:[[74,42],[89,42],[89,58],[74,58]],walkTarget:[75,75],facing:"right"},
  {id:"homestead-exit",label:"بازگشت به اسکله",title:"در ورودی خانه",description:"راه بازگشت به اسکله باز است؛ جمع‌آوری هیچ یک از یادگاری‌ها برای خروج اجباری نیست.",kind:"transition",targetSceneId:"scene_pier",polygon:[[3,57],[16,57],[16,78],[3,78]],walkTarget:[22,79],facing:"left"}
 ]
};
