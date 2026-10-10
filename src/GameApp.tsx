import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  AudioLines,
  BookOpen,
  Check,
  CircleHelp,
  Eye,
  Footprints,
  Info,
  Keyboard,
  MousePointer2,
  RadioTower,
  X,
} from "lucide-react";
import { STUDIO_SCENE, type SceneHotspot } from "./data/scenes/studio";
import {
  distanceBetween,
  pointInPolygon,
  projectToWalkableArea,
  scaleFromDepth,
  type Point,
} from "./engine/navigation/perspective";
import { CharacterSprite } from "./components/viewport/CharacterSprite";
import { HotspotOverlay } from "./components/viewport/HotspotOverlay";
import { InventoryBar } from "./components/ui/InventoryBar";
import { ItemInspectionModal } from "./components/ui/ItemInspectionModal";
import { JournalModal } from "./components/ui/JournalModal";
import { AudioDeskModal, type AudioDeskTab } from "./components/ui/AudioDeskModal";
import { DialogueOverlay } from "./components/ui/DialogueOverlay";
import { ITEMS } from "./data/items";
import { CLUES } from "./data/clues";
import { TAPE13_DIALOGUE } from "./data/dialogues";
import "./game.css";

const STARTING_POSITION: Point = STUDIO_SCENE.spawnPoint;

export default function GameApp() {
  const [player, setPlayer] = useState<Point>(STARTING_POSITION);
  const playerRef = useRef<Point>(STARTING_POSITION);
  const animationRef = useRef<number | null>(null);
  const [facing, setFacing] = useState<"left" | "right" | "front" | "back">("front");
  const [moving, setMoving] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<SceneHotspot | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [status, setStatus] = useState("اتاق را بررسی کن؛ نوار سیزدهم در اینونتوری است و سرنخ‌ها در دفترچه ثبت می‌شوند.");
  const [inventoryIds, setInventoryIds] = useState<string[]>(["tape-13"]);
  const [discoveredClueIds, setDiscoveredClueIds] = useState<string[]>([]);
  const [hypothesisUnlocked, setHypothesisUnlocked] = useState(false);
  const [motorHypothesisUnlocked, setMotorHypothesisUnlocked] = useState(false);
  const [fuseInstalled, setFuseInstalled] = useState(false);
  const [voltageSetting, setVoltageSetting] = useState<"110" | "220">("220");
  const [deckPowered, setDeckPowered] = useState(false);
  const [tapeSpeed, setTapeSpeed] = useState<"9.5" | "19">("9.5");
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [motorAnalysisComplete, setMotorAnalysisComplete] = useState(false);
  const [audioDeskOpen, setAudioDeskOpen] = useState(false);
  const [audioDeskInitialTab, setAudioDeskInitialTab] = useState<AudioDeskTab>("calibration");
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [selectedItemForUse, setSelectedItemForUse] = useState<string | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);

  const moveTo = useCallback((rawTarget: Point, onArrive?: () => void) => {
    const target = projectToWalkableArea(rawTarget, STUDIO_SCENE.walkablePolygon);
    const start = playerRef.current;
    const distance = distanceBetween(start, target);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (distance < 0.6) {
      playerRef.current = target;
      setPlayer(target);
      setMoving(false);
      onArrive?.();
      return;
    }

    setActiveHotspot(null);
    setMoving(true);
    setFacing(target[0] < start[0] ? "left" : "right");
    setStatus("آوا در حال حرکت به نقطهٔ انتخاب‌شده است.");

    const duration = Math.max(300, Math.min(1450, distance * 23));
    let firstFrame: number | null = null;

    const tick = (timestamp: number) => {
      if (firstFrame === null) firstFrame = timestamp;
      const progress = Math.min(1, (timestamp - firstFrame) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      const next: Point = [
        start[0] + (target[0] - start[0]) * eased,
        start[1] + (target[1] - start[1]) * eased,
      ];
      playerRef.current = next;
      setPlayer(next);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
        playerRef.current = target;
        setPlayer(target);
        setMoving(false);
        onArrive?.();
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  }, []);


  const recordClue = useCallback((clueId: string) => {
    const clue = CLUES[clueId];
    if (!clue) return;
    if (!discoveredClueIds.includes(clueId)) {
      setDiscoveredClueIds((current) => current.includes(clueId) ? current : [...current, clueId]);
      setStatus("سرنخ تازه در دفترچه ثبت شد: " + clue.title);
    }
  }, [discoveredClueIds]);

  const collectItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (inventoryIds.includes(itemId)) {
      setStatus("این وسیله از قبل در اینونتوری است.");
      return;
    }
    setInventoryIds((current) => current.includes(itemId) ? current : [...current, itemId]);
    setStatus(item.title + " به اینونتوری اضافه شد.");
  }, [inventoryIds]);

  const inspectItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    setActiveHotspot(null);
    setJournalOpen(false);
    setSelectedItemForUse(null);
    setActiveItemId(itemId);
    if (item.revealsClueId) recordClue(item.revealsClueId);
  }, [recordClue]);

  const connectClues = useCallback((clueIds: string[]) => {
    const chosen = new Set(clueIds);
    const timePair = chosen.size === 2 && chosen.has("tape13-label") && chosen.has("shift-log-2210");
    const motorPair = chosen.size === 2 && chosen.has("motor-40hz") && chosen.has("yanmar-catalog");
    if (timePair) { setHypothesisUnlocked(true); setStatus("فرضیهٔ موقت دربارهٔ زمان ثبت کشیک ساخته شد؛ این اثبات جعل نیست."); return true; }
    if (motorPair) { setMotorHypothesisUnlocked(true); setStatus("فرضیهٔ فنی موقت ساخته شد؛ صدای اصلی و ثبت شناور هنوز باید بررسی شوند."); return true; }
    setStatus("این دو سرنخ هنوز پیوند قابل دفاعی نمی‌سازند؛ مدرک بیشتری لازم است.");
    return false;
  }, []);


  const installFuse = useCallback(() => {
    if (fuseInstalled) { setStatus("فیوز ورودی از قبل نصب شده است."); return; }
    if (!inventoryIds.includes("fuse-2a")) { setStatus("فیوز یدکی ۲ آمپر در اینونتوری نیست؛ ابتدا از کمد ابزار بردار."); return; }
    setInventoryIds(current => current.filter(id => id !== "fuse-2a"));
    setFuseInstalled(true); setDeckPowered(false);
    setStatus("فیوز شیشه‌ای ۲ آمپر نصب شد. پیش از روشن کردن، ولتاژ ورودی باید روی ۱۱۰V باشد.");
  }, [fuseInstalled, inventoryIds]);
  const completeCalibration = useCallback(() => {
    setCalibrationComplete(true); recordClue("tape13-message");
    setStatus("کالیبراسیون موفق شد؛ رونوشت اولیهٔ تماس اضطراری قابل بررسی است.");
  }, [recordClue]);
  const completeMotorAnalysis = useCallback(() => {
    setMotorAnalysisComplete(true); recordClue("motor-40hz");
    setStatus("قلهٔ موتور نزدیک ۴۰ هرتز ثبت شد؛ اکنون آن را با کاتالوگ مستقل مقایسه کن.");
  }, [recordClue]);

  const useItemOnHotspot = useCallback((hotspot: SceneHotspot, itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    const canInstallFuse = hotspot.id === "tape-deck" && itemId === "fuse-2a" && inventoryIds.includes("fuse-2a") && !fuseInstalled;
    let message: string;
    if (hotspot.id === "tape-deck" && itemId === "fuse-2a" && fuseInstalled) message = "فیوز ورودی از قبل نصب شده است؛ چیزی از اینونتوری کم نشد.";
    else if (canInstallFuse) message = "فیوز ۲ آمپر در جایگاه ورودی نصب شد. پیش از روشن کردن، سلکتور باید روی ۱۱۰V باشد.";
    else if (hotspot.id === "tape-deck" && itemId === "tape-13") message = "این نوار سیزدهم است؛ ابتدا برق دستگاه و سرعت مرجع را تنظیم کن.";
    else message = item.title + " کاربرد روشنی روی «" + hotspot.title + "» ندارد. آوا آن را کنار می‌گذارد؛ چیزی از اینونتوری کم نشد.";
    moveTo(hotspot.walkTarget, () => {
      setFacing(hotspot.facing); setActiveHotspot(null); setSelectedItemForUse(null);
      if (canInstallFuse) { setInventoryIds(current => current.filter(id => id !== "fuse-2a")); setFuseInstalled(true); setDeckPowered(false); }
      setStatus(message);
    });
  }, [fuseInstalled, inventoryIds, moveTo]);

  const activateHotspot = useCallback((hotspot: SceneHotspot) => {
    setHoveredHotspotId(null);
    if (selectedItemForUse) {
      useItemOnHotspot(hotspot, selectedItemForUse);
      return;
    }
    setActiveHotspot(null);
    moveTo(hotspot.walkTarget, () => {
      setFacing(hotspot.facing);
      setActiveHotspot(hotspot);
      setStatus("بررسی شد: " + hotspot.title);
      if (hotspot.clueId) recordClue(hotspot.clueId);
    });
  }, [moveTo, recordClue, selectedItemForUse, useItemOnHotspot]);

  const handleViewportClick = (event: MouseEvent<HTMLElement>) => {
    if (activeHotspot || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    // Normalize against the content box, not the 1px CSS border box.
    // This keeps the pointer aligned with the percentage-based scene overlays.
    const contentLeft = rect.left + viewportRef.current.clientLeft;
    const contentTop = rect.top + viewportRef.current.clientTop;
    const contentWidth = viewportRef.current.clientWidth;
    const contentHeight = viewportRef.current.clientHeight;
    const x = ((event.clientX - contentLeft) / contentWidth) * 100;
    const y = ((event.clientY - contentTop) / contentHeight) * 100;
    const target = projectToWalkableArea([x, y], STUDIO_SCENE.walkablePolygon);

    if (!pointInPolygon([x, y], STUDIO_SCENE.walkablePolygon)) {
      setStatus("این نقطه بیرون از سطح حرکت است؛ مقصد به نزدیک‌ترین نقطهٔ مجاز منتقل شد.");
    } else {
      setStatus("آوا به محل انتخاب‌شده حرکت می‌کند.");
    }
    moveTo(target);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveHotspot(null); setActiveItemId(null); setJournalOpen(false);
        setAudioDeskOpen(false); setDialogueOpen(false); setSelectedItemForUse(null);
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setDebugMode((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const depthScale = scaleFromDepth(player[1], STUDIO_SCENE.perspective);

  return (
    <main className="sf-app">
      <header className="sf-topbar">
        <div className="sf-brand">
          <div className="sf-brand__mark" aria-hidden="true"><RadioTower size={22} strokeWidth={1.6} /></div>
          <div>
            <div className="sf-brand__title">فرکانس خاموش</div>
            <div className="sf-brand__subtitle">پروندهٔ نوار سیزدهم</div>
          </div>
        </div>
        <div className="sf-topbar__right">
          <span className="sf-phase-badge"><span /> برش قابل‌بازی · فاز ۳</span>
          <span className="sf-scene-name">{STUDIO_SCENE.title}</span>
          <a className="sf-docs-link" href="?view=docs" title="باز کردن میز مستندات" aria-label="باز کردن میز مستندات">
            <BookOpen size={17} /> مستندات
          </a>
        </div>
      </header>

      <section className="sf-stage" aria-label="محیط قابل‌بازی">
        <section
          className="sf-viewport"
          ref={viewportRef}
          onClick={handleViewportClick}
          aria-label="اتاق پخش ایستگاه رادیویی مه‌آب؛ برای حرکت روی سطح زمین کلیک کن."
        >
          <img className="sf-background" src={STUDIO_SCENE.background} alt="" draggable={false} />
          <div className="sf-window-haze" aria-hidden="true" />
          <div className="sf-rain-glass" aria-hidden="true" />
          <div className="sf-vignette" aria-hidden="true" />

          <div className="sf-scene-label">
            <span className="sf-scene-label__eyebrow">مه‌آب · ۲۳ آبان ۱۳۷۸</span>
            <strong>{STUDIO_SCENE.subtitle}</strong>
            <span className="sf-scene-label__status"><span /> باران شدید · برق اصلی قطع است</span>
          </div>

          <div className="sf-objective">
            <span className="sf-objective__icon"><Eye size={16} /></span>
            <div>
              <span>هدف فعلی</span>
              <strong>اتاق را بررسی کن</strong>
            </div>
          </div>

          <CharacterSprite
            position={player}
            facing={facing}
            moving={moving}
            perspective={STUDIO_SCENE.perspective}
          />

          <HotspotOverlay
            hotspots={STUDIO_SCENE.hotspots}
            hoveredId={hoveredHotspotId}
            debugMode={debugMode}
            onActivate={activateHotspot}
            onHover={setHoveredHotspotId}
            onUseItem={useItemOnHotspot}
          />

          {debugMode && (
            <svg className="sf-debug-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="نمایش نواحی حرکت و نقاط تعامل">
              <polygon
                points={STUDIO_SCENE.walkablePolygon.map((point) => point.join(",")).join(" ")}
                className="sf-debug-overlay__walkable"
              />
              {STUDIO_SCENE.hotspots.map((hotspot) => (
                <polygon
                  key={hotspot.id}
                  points={hotspot.polygon.map((point) => point.join(",")).join(" ")}
                  className="sf-debug-overlay__hotspot"
                />
              ))}
              <circle cx={player[0]} cy={player[1]} r="1.5" className="sf-debug-overlay__anchor" />
            </svg>
          )}

          {debugMode && (
            <div className="sf-debug-readout">
              <strong>QA · NAV</strong>
              <span>X {player[0].toFixed(1)}%</span>
              <span>Foot Y {player[1].toFixed(1)}%</span>
              <span>Scale {depthScale.toFixed(3)}×</span>
              <span>Anchor 50% / 96%</span>
            </div>
          )}

          <div className="sf-viewport-bottom">
            <span><MousePointer2 size={14} /> اشاره کن و کلیک کن</span>
            <span className="sf-viewport-bottom__sep" />
            <span><Footprints size={14} /> حرکت روی کف</span>
          </div>
        </section>
      </section>

      <InventoryBar
        itemIds={inventoryIds}
        discoveredClueCount={discoveredClueIds.length}
        selectedItemForUse={selectedItemForUse}
        onInspectItem={inspectItem}
        onOpenJournal={() => {
          setActiveHotspot(null);
          setActiveItemId(null);
          setSelectedItemForUse(null);
          setJournalOpen(true);
        }}
      />

      <footer className="sf-footer">
        <div className="sf-status" aria-live="polite">
          <span className="sf-status__pulse" />
          {status}
        </div>
        <div className="sf-footer__controls">
          <span><MousePointer2 size={14} /> حرکت</span>
          <span><Eye size={14} /> بررسی</span>
          <span><Keyboard size={14} /> <kbd>Esc</kbd> بستن پنجره</span>
          <button
            type="button"
            className={debugMode ? "sf-debug-toggle sf-debug-toggle--active" : "sf-debug-toggle"}
            onClick={() => setDebugMode((value) => !value)}
            aria-pressed={debugMode}
          >
            <CircleHelp size={14} /> ابزار آزمون
          </button>
        </div>
      </footer>

      {activeHotspot && (
        <div className="sf-dialog-scrim" onClick={() => setActiveHotspot(null)}>
          <section
            className="sf-inspection"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sf-inspection-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sf-inspection__topline">
              <span className="sf-inspection__kicker">
                {activeHotspot.kind === "transition" ? "نمای مسیر" : "بررسی محیط"}
              </span>
              <button type="button" className="sf-icon-button" onClick={() => setActiveHotspot(null)} aria-label="بستن">
                <X size={18} />
              </button>
            </div>
            <div className="sf-inspection__symbol" aria-hidden="true">
              {activeHotspot.kind === "transition" ? <RadioTower size={26} /> : <Eye size={26} />}
            </div>
            <h2 id="sf-inspection-title">{activeHotspot.title}</h2>
            <p>{activeHotspot.description}</p>
            {activeHotspot.kind === "transition" && (
              <div className="sf-inspection__note"><Info size={17} /><span>تعویض کامل صحنه‌ها در فاز بعد به موتور داده‌محور متصل می‌شود؛ اینجا مسیر برای آزمون تعامل و جهت‌گیری آماده است.</span></div>
            )}
            {activeHotspot.id === "tape-deck" && <div className="sf-phase3-actions">
              <button type="button" className="sf-secondary-button" onClick={() => { recordClue("transformer-110v"); setStatus("یادداشت ولتاژ ترانس در دفترچه ثبت شد."); }}><BookOpen size={15}/> بررسی دفترچه تعمیرات</button>
              <button type="button" className="sf-primary-button" onClick={() => { setAudioDeskInitialTab(calibrationComplete ? "motor" : "calibration"); setActiveHotspot(null); setAudioDeskOpen(true); }}><AudioLines size={15}/> باز کردن میز صوتی</button>
            </div>}
            <div className="sf-inspection__bottom">
              <span className="sf-inspection__location"><Check size={15} /> آوا به نقطهٔ تعامل رسیده است</span>
              {activeHotspot.collectibleItemIds?.filter((itemId) => !inventoryIds.includes(itemId)).map((itemId) => {
                const item = ITEMS[itemId];
                const ItemIcon = item.icon;
                return (
                  <button key={itemId} type="button" className="sf-secondary-button" onClick={() => collectItem(itemId)}>
                    <ItemIcon size={15} /> برداشتن {item.title}
                  </button>
                );
              })}
              <button type="button" className="sf-primary-button" onClick={() => setActiveHotspot(null)}>ادامهٔ کاوش</button>
            </div>
          </section>
        </div>
      )}

      {audioDeskOpen && <AudioDeskModal
        inventoryIds={inventoryIds} fuseInstalled={fuseInstalled} voltageSetting={voltageSetting}
        deckPowered={deckPowered} tapeSpeed={tapeSpeed} calibrationComplete={calibrationComplete}
        motorAnalysisComplete={motorAnalysisComplete} initialTab={audioDeskInitialTab}
        onInstallFuse={installFuse} onSetVoltage={v => {setVoltageSetting(v);setDeckPowered(false);}}
        onSetDeckPowered={setDeckPowered} onSetTapeSpeed={setTapeSpeed}
        onCalibrationComplete={completeCalibration} onMotorAnalysisComplete={completeMotorAnalysis}
        onRevealCatalogue={() => recordClue("yanmar-catalog")}
        onOpenTranscript={() => {setAudioDeskOpen(false);setDialogueOpen(true);}}
        onClose={() => setAudioDeskOpen(false)}
      />}
      {dialogueOpen && <DialogueOverlay dialogue={TAPE13_DIALOGUE} onRecordClue={recordClue}
        onContinueAnalysis={() => {setDialogueOpen(false);setAudioDeskInitialTab("motor");setAudioDeskOpen(true);}}
        onClose={() => setDialogueOpen(false)} />}
      {activeItemId && ITEMS[activeItemId] && (
        <ItemInspectionModal
          item={ITEMS[activeItemId]}
          onClose={() => setActiveItemId(null)}
          onSelectForUse={(itemId) => {
            setSelectedItemForUse(itemId);
            setActiveItemId(null);
            setStatus("وسیله انتخاب شد؛ حالا آن را روی شیء مناسب رها کن یا با کلیک روی آن شیء استفاده‌اش کن.");
          }}
        />
      )}

      {journalOpen && (
        <JournalModal
          clues={CLUES}
          discoveredClueIds={discoveredClueIds}
          hypothesisUnlocked={hypothesisUnlocked}
          motorHypothesisUnlocked={motorHypothesisUnlocked}
          onLinkClues={connectClues}
          onClose={() => setJournalOpen(false)}
        />
      )}

      <div className="sf-sr-only" aria-live="polite">{status}</div>
    </main>
  );
}
