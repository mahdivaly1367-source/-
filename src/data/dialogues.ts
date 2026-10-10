export interface DialogueChoiceDefinition { id:string; label:string; response:string; clueId?:string; continueToAnalysis?:boolean }
export interface DialogueDefinition { id:string; title:string; speaker:string; transcript:string; contextNote:string; choices:DialogueChoiceDefinition[] }
export const TAPE13_DIALOGUE:DialogueDefinition={
 id:"tape13-initial-transcript",title:"رونوشت نخستین پخش نوار سیزدهم",speaker:"صدای آرشیوی · ناخدا منصور برخوردار",
 transcript:"سهراب! بگو دانشیار بیاد پای بیسیم... انبار شمارهٔ ۲ آب گرفته... گارد ساحلی نباید بیاد! اون بسته‌ها...",
 contextNote:"این رونوشت از شبیه‌سازی آزمایشی پخش در نمونهٔ فعلی است. صدای اصلی هنوز اضافه نشده؛ متن به‌تنهایی هویت گوینده، زمان دقیق یا مسئولیت هیچ فردی را ثابت نمی‌کند.",
 choices:[
  {id:"warehouse",label:"اشاره به انبار شمارهٔ ۲ را ثبت کن",response:"آوا: «اشاره به انبار شمارهٔ ۲ و جلوگیری از ورود گارد ساحلی را ثبت می‌کنم. این سرنخ مسیر تحقیق است، نه مدرک قطعی علیه فرد مشخص.»",clueId:"cargo-warehouse-2"},
  {id:"father",label:"آیا این بخش بی‌گناهی پدر را ثابت می‌کند؟",response:"آوا: «نه. این چند جمله از تماس و نگرانی دربارهٔ محموله می‌گوید؛ برای زمان‌بندی باید صدای کامل، دفتر کشیک و سوابق فرستنده را کنار هم بگذارم.»"},
  {id:"motor",label:"بررسی صدای پس‌زمینهٔ موتور",response:"ادامهٔ بررسی به میز صوتی منتقل می‌شود. فرکانس موتور باید از نویز و هام برق جدا و بعد با کاتالوگ مستقل مقایسه شود.",continueToAnalysis:true}
 ]
};
