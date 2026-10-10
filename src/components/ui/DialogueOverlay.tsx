import { MessageCircle, PlayCircle, X } from "lucide-react";
import { useState } from "react";
import type { DialogueDefinition, DialogueChoiceDefinition } from "../../data/dialogues";
interface Props { dialogue:DialogueDefinition;onRecordClue:(id:string)=>void;onContinueAnalysis:()=>void;onClose:()=>void }
export function DialogueOverlay({dialogue,onRecordClue,onContinueAnalysis,onClose}:Props){
 const [reply,setReply]=useState<DialogueChoiceDefinition|null>(null);
 const choose=(choice:DialogueChoiceDefinition)=>{if(choice.clueId)onRecordClue(choice.clueId);if(choice.continueToAnalysis){onContinueAnalysis();return;}setReply(choice);};
 return <div className="sf-dialog-scrim" onClick={onClose}><section className="sf-inspection sf-dialogue" role="dialog" aria-modal="true" aria-labelledby="sf-dialogue-title" onClick={e=>e.stopPropagation()}>
  <div className="sf-inspection__topline"><span className="sf-inspection__kicker"><MessageCircle size={14}/> رونوشت و گفت‌وگوی شاخه‌ای</span><button type="button" className="sf-icon-button" onClick={onClose} aria-label="بستن رونوشت"><X size={18}/></button></div>
  <h2 id="sf-dialogue-title">{dialogue.title}</h2><div className="sf-dialogue__recording"><span>{dialogue.speaker}</span><p>«{dialogue.transcript}»</p></div><p className="sf-dialogue__note">{dialogue.contextNote}</p>
  {!reply?<div className="sf-dialogue__choices"><strong>واکنش آوا</strong>{dialogue.choices.map(choice=><button key={choice.id} type="button" className="sf-dialogue__choice" onClick={()=>choose(choice)}>{choice.continueToAnalysis?<PlayCircle size={17}/>:<MessageCircle size={17}/>}<span>{choice.label}</span></button>)}</div>:<div className="sf-dialogue__reply" role="status"><span>یادداشت آوا</span><p>{reply.response}</p></div>}
  <div className="sf-inspection__bottom"><span className="sf-inspection__location">هیچ نتیجه‌ای فراتر از شواهد ثبت نمی‌شود</span><button type="button" className="sf-primary-button" onClick={onClose}>بازگشت به اتاق</button></div>
 </section></div>;
}
