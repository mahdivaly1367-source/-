import { BookOpen, Check, Lightbulb, Link2, NotebookPen, X } from "lucide-react";
import { useState } from "react";
import type { ClueDefinition } from "../../data/clues";
import { INFERENCE_HINTS } from "../../data/clues";

interface JournalModalProps {
  clues: Record<string, ClueDefinition>;
  discoveredClueIds: string[];
  hypothesisUnlocked: boolean;
  motorHypothesisUnlocked: boolean;
  onLinkClues: (clueIds: string[]) => boolean;
  onClose: () => void;
}

type JournalTab = "clues" | "inference" | "notes" | "hints";

const TAB_LABELS: Record<JournalTab, string> = {
  clues: "سرنخ‌ها",
  inference: "استنتاج",
  notes: "یادداشت آوا",
  hints: "راهنما",
};

export function JournalModal({
  clues,
  discoveredClueIds,
  hypothesisUnlocked,
  motorHypothesisUnlocked,
  onLinkClues,
  onClose,
}: JournalModalProps) {
  const [tab, setTab] = useState<JournalTab>("clues");
  const [selectedClueIds, setSelectedClueIds] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState("");
  const discoveredClues = discoveredClueIds.map((id) => clues[id]).filter(Boolean);

  const toggleClue = (clueId: string) => {
    setSelectedClueIds((current) =>
      current.includes(clueId)
        ? current.filter((id) => id !== clueId)
        : current.length < 2 ? [...current, clueId] : [current[1], clueId],
    );
    setFeedback("");
  };

  const attemptLink = () => {
    const success = onLinkClues(selectedClueIds);
    setFeedback(success
      ? "پیوند ثبت شد؛ این هنوز یک فرضیهٔ موقت است، نه حکم قطعی."
      : "این جفت هنوز استنتاج قابل دفاعی نمی‌سازد. هر سرنخ را فقط به اندازهٔ چیزی که واقعاً نشان می‌دهد به کار ببر.");
  };

  return (
    <div className="sf-dialog-scrim" onClick={onClose}>
      <section
        className="sf-inspection sf-journal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-journal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sf-inspection__topline">
          <span className="sf-inspection__kicker">پروندهٔ ۱۳ · یادداشت‌های تحقیق</span>
          <button type="button" className="sf-icon-button" onClick={onClose} aria-label="بستن دفترچه">
            <X size={18} />
          </button>
        </div>
        <div className="sf-journal__heading">
          <span className="sf-inspection__symbol"><BookOpen size={23} /></span>
          <div>
            <h2 id="sf-journal-title">دفترچهٔ کارآگاهی آوا</h2>
            <p>{discoveredClues.length} سرنخ ثبت‌شده · هیچ فرضیه‌ای حکم قطعی نیست</p>
          </div>
        </div>

        <div className="sf-journal__tabs" role="tablist" aria-label="بخش‌های دفترچه">
          {(Object.keys(TAB_LABELS) as JournalTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={tab === key ? "sf-journal__tab sf-journal__tab--active" : "sf-journal__tab"}
              onClick={() => setTab(key)}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {tab === "clues" && (
          <div className="sf-journal__body">
            {discoveredClues.length === 0 ? (
              <div className="sf-journal__empty">هنوز سرنخی ثبت نشده است. نوار را بررسی کن و سپس سراغ تختهٔ کشیک برو.</div>
            ) : discoveredClues.map((clue) => (
              <article key={clue.id} className="sf-clue-card">
                <span className="sf-clue-card__source">{clue.source}</span>
                <h3>{clue.title}</h3>
                <p className="sf-clue-card__summary">{clue.summary}</p>
                <p>{clue.detail}</p>
              </article>
            ))}
          </div>
        )}

        {tab === "inference" && (
          <div className="sf-journal__body">
            <p className="sf-journal__intro">دو سرنخ را انتخاب کن تا رابطه‌شان را بسنجی. انتخاب اشتباه فقط بازخورد می‌دهد؛ هیچ مدرکی مصرف نمی‌شود.</p>
            {discoveredClues.length < 2 ? (
              <div className="sf-journal__empty">برای استنتاج، دست‌کم دو سرنخ لازم است. فعلاً نوار سیزدهم و تختهٔ کشیک را بررسی کن.</div>
            ) : (
              <div className="sf-inference-options">
                {discoveredClues.map((clue) => (
                  <label key={clue.id} className="sf-inference-option">
                    <input
                      type="checkbox"
                      checked={selectedClueIds.includes(clue.id)}
                      aria-label={clue.title}
                      onChange={() => toggleClue(clue.id)}
                    />
                    <span>
                      <strong>{clue.title}</strong>
                      <small>{clue.summary}</small>
                    </span>
                  </label>
                ))}
                <button type="button" className="sf-primary-button" disabled={selectedClueIds.length !== 2} onClick={attemptLink}>
                  <Link2 size={15} /> اتصال شواهد انتخاب‌شده
                </button>
              </div>
            )}

            {feedback && <p className="sf-journal__feedback" role="status">{feedback}</p>}

            {hypothesisUnlocked && (
              <article className="sf-hypothesis">
                <span><Check size={15} /> فرضیهٔ موقت ثبت‌شده</span>
                <h3>زمان ثبت کشیک نیازمند راستی‌آزمایی است</h3>
                <p>خط آبی ساعت ۲۲:۱۰ با نوشته‌های اطراف تفاوت دارد؛ برچسب نوار فقط تنظیم فنی ضبط را نشان می‌دهد. این پیوند به‌تنهایی جعل، زمان دقیق واقعه یا هویت مسئول را ثابت نمی‌کند. صدای نوار و شواهد بعدی لازم‌اند.</p>
              </article>
            )}
            {motorHypothesisUnlocked && (
              <article className="sf-hypothesis">
                <span><Check size={15} /> فرضیهٔ فنی موقت</span>
                <h3>نوع موتور گزارش‌شده نیازمند بررسی دوباره است</h3>
                <p>قلهٔ نزدیک ۴۰ هرتز با محدودهٔ کاتالوگ یانمار دیزل سازگار است و با محدودهٔ یاماها بنزینی تفاوت دارد. چون ورودی فعلی مصنوعی است، تا تحلیل نوار اصلی و تطبیق با ثبت شناور نمی‌توان نتیجهٔ قطعی گرفت.</p>
              </article>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="sf-journal__body">
            <div className="sf-note-paper">
              <span><NotebookPen size={16} /> یادداشت‌های میدانی آوا</span>
              <p>مشاهده را از نتیجه‌گیری جدا نگه دارم. مشخصات فنی نوار، خط متفاوت روی دفتر کشیک و وضعیت برق دستگاه سه موضوع مرتبط اما یکسان نیستند.</p>
              {discoveredClues.map((clue) => (
                <div className="sf-note-paper__entry" key={clue.id}>
                  <strong>{clue.title}</strong>
                  <p>{clue.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "hints" && (
          <div className="sf-journal__body">
            <div className="sf-hint-panel">
              <span><Lightbulb size={17} /> راهنمای مرحله‌ای</span>
              <p>راهنماها به‌ترتیب آشکار می‌شوند؛ سطح اول پاسخ را لو نمی‌دهد.</p>
              {hintLevel > 0 && (
                <article className="sf-hint-panel__current">
                  <span>راهنمای {hintLevel} از ۳</span>
                  <p>{INFERENCE_HINTS[hintLevel - 1]}</p>
                </article>
              )}
              <button
                type="button"
                className="sf-secondary-button"
                disabled={hintLevel >= INFERENCE_HINTS.length}
                onClick={() => setHintLevel((level) => Math.min(INFERENCE_HINTS.length, level + 1))}
              >
                {hintLevel >= INFERENCE_HINTS.length ? "همهٔ راهنماها دیده شده‌اند" : "نمایش راهنمای بعدی"}
              </button>
            </div>
          </div>
        )}

        <div className="sf-journal__footer">
          <span>{hypothesisUnlocked || motorHypothesisUnlocked ? <Check size={14} /> : <BookOpen size={14} />} {hypothesisUnlocked || motorHypothesisUnlocked ? "فرضیهٔ موقت ثبت شده؛ تحقیق ادامه دارد" : "فرضیه‌سازی بر پایهٔ شواهد، نه حدس"}</span>
          <button type="button" className="sf-primary-button" onClick={onClose}>بازگشت به اتاق</button>
        </div>
      </section>
    </div>
  );
}
