import { Activity, AudioLines, BookOpen, Check, Power, RadioTower, ShieldAlert, Volume2, X } from "lucide-react";
import { useState } from "react";
import { analyzeMotorSignal, playCalibrationTone, type MotorSignalMetrics } from "../../engine/audio/TapeDSP";
export type AudioDeskTab="calibration"|"motor";
interface Props {
 inventoryIds:string[];fuseInstalled:boolean;voltageSetting:"110"|"220";deckPowered:boolean;tapeSpeed:"9.5"|"19";
 calibrationComplete:boolean;motorAnalysisComplete:boolean;initialTab:AudioDeskTab;
 onInstallFuse:()=>void;onSetVoltage:(v:"110"|"220")=>void;onSetDeckPowered:(v:boolean)=>void;onSetTapeSpeed:(v:"9.5"|"19")=>void;
 onCalibrationComplete:()=>void;onMotorAnalysisComplete:()=>void;onRevealCatalogue:()=>void;onOpenTranscript:()=>void;onClose:()=>void;
}
export function AudioDeskModal(p:Props){
 const [tab,setTab]=useState<AudioDeskTab>(p.initialTab),[lowPass,setLowPass]=useState("1200"),[notch,setNotch]=useState("60");
 const [playing,setPlaying]=useState(false),[analyzing,setAnalyzing]=useState(false),[metrics,setMetrics]=useState<MotorSignalMetrics|null>(null);
 const [feedback,setFeedback]=useState(""),[catalogue,setCatalogue]=useState(false);
 const hasTape=p.inventoryIds.includes("tape-13"),hasFuse=p.inventoryIds.includes("fuse-2a");
 const playPilot=async()=>{
  if(!hasTape){setFeedback("نوار سیزدهم در اینونتوری نیست.");return;}
  if(!p.fuseInstalled){setFeedback("فیوز ورودی نصب نشده است؛ دستگاه را روشن نکن.");return;}
  if(!p.deckPowered){setFeedback("دستگاه هنوز روشن نیست؛ ابتدا فیوز و ولتاژ را بررسی کن.");return;}
  if(p.tapeSpeed!=="19"){setPlaying(true);setFeedback("صدا کشیده و بم است؛ سرعت انتخاب‌شده با برچسب نوار سازگار نیست.");try{await playCalibrationTone(500,650)}catch{}finally{setPlaying(false)}return;}
  setPlaying(true);setFeedback("سوت مرجع ۱۰۰۰ هرتز پخش می‌شود؛ این صدای آزمایشی است، نه فایل ضبط اصلی.");
  try{await playCalibrationTone(1000,850);p.onCalibrationComplete();setFeedback("کالیبراسیون موفق: سوت مرجع ۱۰۰۰ هرتز صاف شنیده شد.");}
  catch{setFeedback("تنظیم مرجع درست است اما پخش صوت در این مرورگر در دسترس نبود؛ وضعیت منطقی ثبت شد.");p.onCalibrationComplete();}
  finally{setPlaying(false);}
 };
 const analyze=async()=>{
  if(!p.calibrationComplete){setFeedback("ابتدا تغذیه و سرعت پخش را در بخش کالیبراسیون حل کن.");setTab("calibration");return;}
  setAnalyzing(true);setFeedback("سیگنال مصنوعی از فیلترهای واقعی Web Audio عبور می‌کند...");
  try{
   const result=await analyzeMotorSignal({lowPassHz:Number(lowPass),notchHz:Number(notch),durationMs:2300,onMetrics:setMetrics});setMetrics(result);
   const ok=Number(lowPass)<=350&&Math.abs(Number(notch)-50)<=2&&result.peakFrequencyHz>=35&&result.peakFrequencyHz<=45;
   if(ok){p.onMotorAnalysisComplete();setFeedback("تحلیل تأیید شد: قلهٔ ۳۵ تا ۴۵ هرتز باقی مانده و هام ۵۰ هرتز تضعیف شده است.");}
   else if(Math.abs(Number(notch)-50)>2)setFeedback("هام برق شهر هنوز به‌درستی حذف نشده؛ Notch را نزدیک ۵۰ هرتز تنظیم کن.");
   else if(Number(lowPass)>350)setFeedback("باد و زوزهٔ پرفرکانس باقی است؛ پایین‌گذر را روی ۳۰۰ هرتز امتحان کن.");
   else setFeedback("قلهٔ قابل اتکا در بازهٔ موتور دیزل دیده نشد؛ دوباره تحلیل کن.");
  }catch{setFeedback("موتور صوتی مرورگر در دسترس نبود؛ تنظیمات را بازبینی و دوباره امتحان کن.");}finally{setAnalyzing(false);}
 };
 return <div className="sf-dialog-scrim" onClick={analyzing||playing?undefined:p.onClose}>
  <section className="sf-inspection sf-audio-desk" role="dialog" aria-modal="true" aria-labelledby="sf-audio-title" onClick={e=>e.stopPropagation()}>
   <div className="sf-inspection__topline"><span className="sf-inspection__kicker"><RadioTower size={14}/> میز فنی ریواکس B77</span><button className="sf-icon-button" type="button" aria-label="بستن میز صوتی" onClick={p.onClose} disabled={analyzing||playing}><X size={18}/></button></div>
   <div className="sf-audio-desk__heading"><span className="sf-inspection__symbol"><AudioLines size={24}/></span><div><h2 id="sf-audio-title">بازسازی نوار سیزدهم</h2><p>فیلترهای Web Audio واقعی · نمونهٔ مصنوعی برای آزمایش</p></div></div>
   <div className="sf-audio-tabs" role="tablist" aria-label="بخش‌های میز صوتی">
    <button type="button" role="tab" aria-selected={tab==="calibration"} className={tab==="calibration"?"sf-audio-tab sf-audio-tab--active":"sf-audio-tab"} onClick={()=>setTab("calibration")}>تغذیه و کالیبراسیون</button>
    <button type="button" role="tab" aria-selected={tab==="motor"} className={tab==="motor"?"sf-audio-tab sf-audio-tab--active":"sf-audio-tab"} disabled={!p.calibrationComplete} onClick={()=>setTab("motor")}>تحلیل موتور</button>
   </div>
   {tab==="calibration"&&<div className="sf-audio-desk__body">
    <div className="sf-audio-status-grid">
     <div className={p.fuseInstalled?"sf-audio-status-card sf-audio-status-card--ok":"sf-audio-status-card"}><span>فیوز ورودی</span><strong>{p.fuseInstalled?"فیوز ۲A نصب است":"فیوز نصب نشده"}</strong></div>
     <div className={p.deckPowered?"sf-audio-status-card sf-audio-status-card--ok":"sf-audio-status-card"}><span>تغذیه</span><strong>{p.deckPowered?"روشن":"خاموش"}</strong></div>
     <div className={p.calibrationComplete?"sf-audio-status-card sf-audio-status-card--ok":"sf-audio-status-card"}><span>کالیبراسیون</span><strong>{p.calibrationComplete?"تأیید شده":"در انتظار"}</strong></div>
    </div>
    <div className="sf-audio-control-block"><div className="sf-audio-control__label"><strong>۱. فیوز و ولتاژ ورودی</strong><span>ترانس کاهندهٔ دستگاه روی ۱۱۰ ولت تنظیم شده است.</span></div>
     {!p.fuseInstalled&&<button type="button" className="sf-secondary-button" disabled={!hasFuse} onClick={p.onInstallFuse}><Power size={15}/>{hasFuse?"نصب فیوز شیشه‌ای ۲ آمپر":"برای نصب، فیوز ۲A را از کمد بردار"}</button>}
     <div className="sf-choice-row"><button type="button" aria-pressed={p.voltageSetting==="110"} className={p.voltageSetting==="110"?"sf-choice sf-choice--active":"sf-choice"} disabled={p.deckPowered} onClick={()=>{p.onSetVoltage("110");setFeedback("")}}>۱۱۰V · ترانس کاهنده</button><button type="button" aria-pressed={p.voltageSetting==="220"} className={p.voltageSetting==="220"?"sf-choice sf-choice--active":"sf-choice"} disabled={p.deckPowered} onClick={()=>{p.onSetVoltage("220");setFeedback("")}}>۲۲۰V · برق شهری</button></div>
     <button type="button" className="sf-primary-button" disabled={p.deckPowered} onClick={()=>{if(!p.fuseInstalled){setFeedback("برق به مدار نمی‌رسد؛ ابتدا فیوز ۲A را نصب کن.");return;}if(p.voltageSetting!=="110"){setFeedback("خطر اضافه‌ولتاژ: ترانس این دستگاه باید روی ۱۱۰V باشد.");return;}p.onSetDeckPowered(true);setFeedback("تغذیه آماده است؛ حالا سرعت نوار را با برچسب تطبیق بده.");}}><Power size={15}/> روشن کردن دستگاه</button>
     {p.deckPowered&&<button type="button" className="sf-secondary-button" onClick={()=>{p.onSetDeckPowered(false);setFeedback("دستگاه خاموش شد.")}}>خاموش کردن دستگاه</button>}
    </div>
    <div className="sf-audio-control-block"><div className="sf-audio-control__label"><strong>۲. سرعت پخش</strong><span>برچسب نوار، سرعت ۱۹ cm/s را نشان می‌دهد.</span></div>
     <div className="sf-choice-row"><button type="button" aria-pressed={p.tapeSpeed==="9.5"} className={p.tapeSpeed==="9.5"?"sf-choice sf-choice--active":"sf-choice"} onClick={()=>p.onSetTapeSpeed("9.5")}>۹٫۵ cm/s</button><button type="button" aria-pressed={p.tapeSpeed==="19"} className={p.tapeSpeed==="19"?"sf-choice sf-choice--active":"sf-choice"} onClick={()=>p.onSetTapeSpeed("19")}>۱۹ cm/s</button></div>
     <button type="button" className="sf-primary-button" disabled={playing} onClick={()=>void playPilot()}><Volume2 size={15}/>{playing?"در حال پخش...":"پخش سوت مرجع"}</button>
    </div>
    {p.calibrationComplete&&<div className="sf-audio-success"><Check size={16}/><div><strong>معمای کالیبراسیون حل شد</strong><p>رونوشت اولیه و تحلیل پس‌زمینه باز شده‌اند.</p></div><button type="button" className="sf-secondary-button" onClick={p.onOpenTranscript}>گشودن رونوشت نوار</button></div>}
   </div>}
   {tab==="motor"&&<div className="sf-audio-desk__body">
    <p className="sf-audio-intro">سیگنال آزمایشی از مؤلفهٔ ۴۰Hz، هام برق ۵۰Hz و نویز ساخته می‌شود. فایل صوتی اصلی هنوز اضافه نشده است.</p>
    <div className="sf-audio-filter-grid"><label className="sf-audio-field"><span>پایین‌گذر · Low-pass</span><select aria-label="فرکانس پایین‌گذر" value={lowPass} disabled={analyzing} onChange={e=>setLowPass(e.target.value)}><option value="200">۲۰۰ هرتز</option><option value="300">۳۰۰ هرتز</option><option value="800">۸۰۰ هرتز</option><option value="1200">۱۲۰۰ هرتز</option></select></label><label className="sf-audio-field"><span>حذف هام · Notch</span><select aria-label="فرکانس حذف هام" value={notch} disabled={analyzing} onChange={e=>setNotch(e.target.value)}><option value="40">۴۰ هرتز</option><option value="50">۵۰ هرتز</option><option value="60">۶۰ هرتز</option></select></label></div>
    <div className="sf-audio-monitor"><div className="sf-audio-monitor__head"><span><Activity size={15}/> پایش طیف و VU</span><span>{metrics?metrics.peakDb.toFixed(1)+" dB":"در انتظار سیگنال"}</span></div><div className="sf-spectrum-bars" aria-hidden="true">{Array.from({length:20},(_,i)=>{const active=metrics&&Math.abs(i*10-metrics.peakFrequencyHz)<7;return <span key={i} style={{height:(active?72:12+(i*17)%29)+"%"}}/>})}</div><div className="sf-audio-monitor__numbers" aria-live="polite"><span>قلهٔ فعلی <strong>{metrics?metrics.peakFrequencyHz.toFixed(1)+" Hz":"—"}</strong></span><span>VU <strong>{metrics?Math.min(100,Math.round(metrics.rms*330))+"%":"—"}</strong></span></div><div className="sf-vu-track"><span style={{width:Math.min(100,(metrics?.rms??0)*330)+"%"}}/></div></div>
    <button type="button" className="sf-primary-button" disabled={analyzing} onClick={()=>void analyze()}><Activity size={15}/>{analyzing?"در حال تحلیل...":"تحلیل سیگنال"}</button>
    <div className="sf-catalogue-card"><div><BookOpen size={17}/><strong>مرجع فنی موتورهای شیلات</strong></div><p><b>یاماها بنزینی:</b> حدود ۱۲۰ تا ۱۵۰ هرتز.</p><p><b>یانمار دیزل ۶ سیلندر:</b> حدود ۳۵ تا ۴۵ هرتز.</p><button type="button" className="sf-secondary-button" onClick={()=>{p.onRevealCatalogue();setCatalogue(true)}}>{catalogue?"کاتالوگ در دفترچه ثبت شده":"ثبت کاتالوگ در دفترچه"}</button></div>
    {p.motorAnalysisComplete&&<div className="sf-audio-success"><Check size={16}/><div><strong>تحلیل موتور ثبت شد</strong><p>اندازه‌گیری را با کاتالوگ پیوند بده؛ فرکانس به‌تنهایی هویت شناور را ثابت نمی‌کند.</p></div></div>}
   </div>}
   {feedback&&<p className="sf-journal__feedback" role="status">{feedback}</p>}
   <div className="sf-audio-desk__footer"><span><ShieldAlert size={15}/> صوت مصنوعی آزمایشی؛ نه صدای واقعی پرونده</span><button type="button" className="sf-primary-button" onClick={p.onClose} disabled={analyzing||playing}>بازگشت به اتاق</button></div>
  </section>
 </div>;
}
