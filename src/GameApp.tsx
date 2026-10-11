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
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { type SceneHotspot, type SceneId } from "./data/scenes/studio";
import { SCENES } from "./data/scenes";
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
import { AmbientSoundscape } from "./engine/audio/AmbientSoundscape";
import "./game.css";

const STARTING_SCENE_ID: SceneId = "scene_exterior";
const STARTING_POSITION: Point = SCENES[STARTING_SCENE_ID].spawnPoint;

export default function GameApp() {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>(STARTING_SCENE_ID);
  const currentScene = SCENES[currentSceneId];
  const [player, setPlayer] = useState<Point>(STARTING_POSITION);
  const playerRef = useRef<Point>(STARTING_POSITION);
  const animationRef = useRef<number | null>(null);
  const [facing, setFacing] = useState<"left" | "right" | "front" | "back">("front");
  const [moving, setMoving] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<SceneHotspot | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [ambienceEnabled, setAmbienceEnabled] = useState(false);
  const ambienceRef = useRef<AmbientSoundscape | null>(null);
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
  const [stationDoorUnlocked, setStationDoorUnlocked] = useState(false);
  const [transmitterPanelOpened, setTransmitterPanelOpened] = useState(false);
  const [bahmanConfessed, setBahmanConfessed] = useState(false);
  const [khosroMet, setKhosroMet] = useState(false);
  const [forkResonating, setForkResonating] = useState(false);
  const [hatchOpened, setHatchOpened] = useState(false);
  const [hatchCode, setHatchCode] = useState("");
  const [gameEnded, setGameEnded] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [selectedItemForUse, setSelectedItemForUse] = useState<string | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);

  const toggleAmbience = useCallback(async () => {
    if (ambienceEnabled) {
      setAmbienceEnabled(false);
      void ambienceRef.current?.stop();
      setStatus("صدای محیط خاموش شد.");
      return;
    }

    const soundscape = ambienceRef.current ?? new AmbientSoundscape();
    ambienceRef.current = soundscape;
    try {
      await soundscape.start(currentSceneId);
      setAmbienceEnabled(true);
      setStatus("صدای محیط فعال شد؛ با تغییر لوکیشن، بافت صوتی هم تغییر می‌کند.");
    } catch {
      setStatus("صدای محیط در این مرورگر در دسترس نیست؛ بازی بدون صدا ادامه دارد.");
    }
  }, [ambienceEnabled, currentSceneId]);

  useEffect(() => {
    if (ambienceEnabled) ambienceRef.current?.setScene(currentSceneId);
  }, [ambienceEnabled, currentSceneId]);

  useEffect(() => () => {
    void ambienceRef.current?.dispose();
  }, []);

  const moveTo = useCallback((rawTarget: Point, onArrive?: () => void) => {
    const target = projectToWalkableArea(rawTarget, currentScene.walkablePolygon);
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
  }, [currentScene]);

  const changeScene = useCallback((sceneId: SceneId) => {
    const next = SCENES[sceneId];
    setCurrentSceneId(sceneId);
    playerRef.current = next.spawnPoint;
    setPlayer(next.spawnPoint);
    setFacing("front");
    setMoving(false);
    setActiveHotspot(null);
    setHoveredHotspotId(null);
    setSelectedItemForUse(null);
    setStatus("ورود به صحنه: " + next.title);
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

    if (hotspot.action === "station-door" && itemId === "insulated-cutters" && currentSceneId === "scene_exterior") {
      moveTo(hotspot.walkTarget, () => {
        setStationDoorUnlocked(true);
        setStatus("زنجیر بریده شد؛ در ایستگاه باز است.");
        if (hotspot.targetSceneId) changeScene(hotspot.targetSceneId);
      });
      return;
    }
    if (hotspot.action === "transmitter-panel" && itemId === "rusty-wrench" && currentSceneId === "scene_studio") {
      moveTo(hotspot.walkTarget, () => {
        setTransmitterPanelOpened(true);
        setActiveHotspot(hotspot);
        setSelectedItemForUse(null);
        setStatus("قاب تابلوی فرستنده باز شد؛ فیوز را با دقت بررسی کن.");
      });
      return;
    }
    if (hotspot.action === "floor-hatch" && itemId === "tuning-fork-440" && currentSceneId === "scene_studio") {
      moveTo(hotspot.walkTarget, () => {
        setForkResonating(true);
        setHatchCode("");
        setActiveHotspot(hotspot);
        setSelectedItemForUse(null);
        setStatus("دیاپازون ۴۴۰ هرتز مرتعش است؛ ده ثانیه برای جاگذاری در شیار تشدید فرصت داری.");
        window.setTimeout(() => setForkResonating(false), 10000);
      });
      return;
    }

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
  }, [currentSceneId, changeScene, fuseInstalled, inventoryIds, moveTo]);

  const activateHotspot = useCallback((hotspot: SceneHotspot) => {
    setHoveredHotspotId(null);
    if (selectedItemForUse) { useItemOnHotspot(hotspot, selectedItemForUse); return; }

    if (hotspot.action === "station-door" && !stationDoorUnlocked) {
      setActiveHotspot(hotspot); setStatus(hotspot.lockedMessage ?? "در ایستگاه قفل است."); return;
    }
    if (hotspot.targetSceneId) {
      if (hotspot.requiredItemId && !inventoryIds.includes(hotspot.requiredItemId)) {
        setActiveHotspot(hotspot); setStatus(hotspot.lockedMessage ?? "برای این مسیر هنوز وسیلهٔ لازم را نداری."); return;
      }
      moveTo(hotspot.walkTarget, () => changeScene(hotspot.targetSceneId!));
      return;
    }
    setActiveHotspot(null);
    moveTo(hotspot.walkTarget, () => {
      setFacing(hotspot.facing); setActiveHotspot(hotspot);
      setStatus("بررسی شد: " + hotspot.title);
      if (hotspot.clueId) recordClue(hotspot.clueId);
    });
  }, [changeScene, inventoryIds, moveTo, recordClue, selectedItemForUse, stationDoorUnlocked, useItemOnHotspot]);

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
    const target = projectToWalkableArea([x, y], currentScene.walkablePolygon);

    if (!pointInPolygon([x, y], currentScene.walkablePolygon)) {
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

  const depthScale = scaleFromDepth(player[1], currentScene.perspective);
  const bahmanEvidenceReady =
    discoveredClueIds.includes("tampered-fuse-marks") &&
    discoveredClueIds.includes("shift-log-correction") &&
    discoveredClueIds.includes("bahman-tool-marks");
  const hatchEvidenceReady =
    discoveredClueIds.includes("opening-photo-1359") &&
    discoveredClueIds.includes("frequency-note-1359");
  const activeCollectibleItemIds = activeHotspot ? Array.from(new Set([
    ...(activeHotspot.collectibleItemIds ?? []),
    ...(activeHotspot.action === "transmitter-panel" && transmitterPanelOpened ? ["fuse-tamper-evidence"] : []),
    ...(activeHotspot.action === "floor-hatch" && hatchOpened ? ["master-tape-13", "sohrab-letter"] : []),
  ])) : [];

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
          <span className="sf-phase-badge"><span /> فضاسازی محیطی · فاز ۵</span>
          <span className="sf-scene-name">{currentScene.title}</span>
          <a className="sf-docs-link" href="?view=docs" title="باز کردن میز مستندات" aria-label="باز کردن میز مستندات">
            <BookOpen size={17} /> مستندات
          </a>
        </div>
      </header>

      <section className="sf-stage" aria-label="محیط قابل‌بازی">
        <section
          className="sf-viewport"
          data-scene={currentSceneId}
          ref={viewportRef}
          onClick={handleViewportClick}
          aria-label={currentScene.title + "؛ برای حرکت روی سطح زمین کلیک کن."}
        >
          <img className="sf-background" src={currentScene.background} alt="" draggable={false} />
          <div className="sf-window-haze" aria-hidden="true" />
          <div className="sf-rain-glass" aria-hidden="true" />
          <div className="sf-vignette" aria-hidden="true" />
          <div className={`sf-atmosphere sf-atmosphere--${currentSceneId}`} aria-hidden="true" />

          <div className="sf-scene-label">
            <span className="sf-scene-label__eyebrow">بندر مه‌آب · ۲۳ آبان ۱۳۷۸</span>
            <strong>{currentScene.subtitle}</strong>
            <span className="sf-scene-label__status"><span /> پروندهٔ نوار سیزدهم · تحقیق ادامه دارد</span>
          </div>

          <div className="sf-objective">
            <span className="sf-objective__icon"><Eye size={16} /></span>
            <div>
              <span>هدف فعلی</span>
              <strong>{gameEnded ? "پرونده تکمیل شد" :
                currentSceneId === "scene_exterior" ? (inventoryIds.includes("insulated-cutters") ? "زنجیر در را با سیم‌چین باز کن" : "جعبه‌ابزار کنار بولدوزر را بگرد") :
                currentSceneId === "scene_studio" ? (hatchOpened ? "نوار مستر را به مرجع مستقل بسپار" : "دستگاه ضبط و شواهد ایستگاه را بررسی کن") :
                currentSceneId === "scene_archive" ? "نوارها و سوابق رسمی را مقایسه کن" :
                currentSceneId === "scene_pier" ? (bahmanConfessed ? "کلید فانوس را به کار بگیر" : "مدارک فنی را برای گفت‌وگو آماده کن") :
                currentSceneId === "scene_lighthouse" ? (khosroMet ? "به خانهٔ راد سر بزن" : "با خسرو گفت‌وگو کن") :
                "عکس افتتاحیه و یادداشت ۱۳۵۹ را پیدا کن"}</strong>
            </div>
          </div>

          <CharacterSprite
            position={player}
            facing={facing}
            moving={moving}
            perspective={currentScene.perspective}
          />

          {currentScene.foregroundImage && (
            <img
              className="sf-foreground"
              src={currentScene.foregroundImage}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          )}

          <HotspotOverlay
            hotspots={currentScene.hotspots}
            hoveredId={hoveredHotspotId}
            debugMode={debugMode}
            onActivate={activateHotspot}
            onHover={setHoveredHotspotId}
            onUseItem={useItemOnHotspot}
          />

          {debugMode && (
            <svg className="sf-debug-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="نمایش نواحی حرکت و نقاط تعامل">
              <polygon
                points={currentScene.walkablePolygon.map((point) => point.join(",")).join(" ")}
                className="sf-debug-overlay__walkable"
              />
              {currentScene.hotspots.map((hotspot) => (
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
            className={ambienceEnabled ? "sf-ambience-toggle sf-ambience-toggle--active" : "sf-ambience-toggle"}
            onClick={toggleAmbience}
            aria-pressed={ambienceEnabled}
            aria-label={ambienceEnabled ? "خاموش کردن صدای محیط" : "فعال کردن صدای محیط"}
            data-testid="ambience-toggle"
            title="صدای محیط به‌صورت اختیاری و بدون فایل خارجی تولید می‌شود"
          >
            {ambienceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {ambienceEnabled ? "صدای محیط: روشن" : "صدای محیط"}
          </button>
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
            {activeHotspot.kind === "transition" && activeHotspot.targetSceneId && (
              <div className="sf-inspection__note"><Info size={17} /><span>مسیر به «{SCENES[activeHotspot.targetSceneId].title}» متصل است. {activeHotspot.lockedMessage ?? ""}</span></div>
            )}
            {activeHotspot.action === "station-door" && !stationDoorUnlocked && (
              <div className="sf-phase4-note">زنجیر هنوز بسته است. سیم‌چین عایق‌دار را از اینونتوری انتخاب کن و روی در بینداز؛ مسیر ساحل در هر حال باز می‌ماند.</div>
            )}
            {activeHotspot.action === "transmitter-panel" && (
              <div className="sf-phase4-actions">
                {!transmitterPanelOpened ? <p>قاب پیچ‌شده است. آچار فرانسه را از اینونتوری انتخاب کن و روی تابلو استفاده کن.</p> : (
                  <div><p>قاب باز شده است. فیوز را بردار و در دفترچه ثبت کن؛ رشته سالم است و پایه اثر کشیدگی ابزار دارد.</p>
                    {!inventoryIds.includes("fuse-tamper-evidence") && <button type="button" className="sf-secondary-button" onClick={() => collectItem("fuse-tamper-evidence")}><Zap size={15}/> برداشتن فیوز به‌عنوان مدرک</button>}
                  </div>
                )}
              </div>
            )}
            {activeHotspot.action === "bahman-confession" && (
              <div className="sf-phase4-actions">
                <p>{bahmanConfessed ? "بهمن گفته است که به دستور مافوق، فیوز فرستنده را پایین کشیده بود. گفته‌اش را با نسخهٔ مستر و اسناد مستقل تطبیق بده." : bahmanEvidenceReady ? "سه قرینه آماده است: اثر ابزار روی فیوز، برگهٔ اصلاح‌شده و شباهت اولیهٔ انبردست. می‌توانی از بهمن توضیح بخواهی." : "بهمن به‌راحتی دربارهٔ شب حادثه حرف نمی‌زند. برای گفت‌وگوی مستند، فیوز را با آچار باز کن، برگهٔ کشیک را بردار و انبردست روی میز را بررسی کن."}</p>
                {!bahmanConfessed && <button type="button" className="sf-primary-button" onClick={() => {
                  if (!bahmanEvidenceReady) { setStatus("هنوز هر سه قرینه لازم نیستند؛ فیوز، برگهٔ کشیک و انبردست را جداگانه بررسی کن."); return; }
                  setBahmanConfessed(true);
                  collectItem("lighthouse-key");
                  recordClue("bahman-confession");
                  setStatus("بهمن اعتراف کرد و کلید فانوس را به آوا سپرد؛ اظهارات او باید با شواهد مستقل تطبیق داده شود.");
                }}>ارائهٔ شواهد و گفت‌وگو با بهمن</button>}
              </div>
            )}
            {activeHotspot.action === "khosro-meeting" && (
              <div className="sf-phase4-actions">
                <p>{khosroMet ? "خسرو گفت سهراب از غرق‌شدن نجات یافت، سال‌ها دور از بندر زندگی کرد و نسخهٔ مستر را برای روزی مناسب پنهان گذاشت. نامهٔ داخل محفظه باید این روایت را تکمیل کند." : "خسرو پس از دیدن یادداشت‌های آوا، سرنوشت سهراب را شرح می‌دهد و دیاپازون نقره‌ای او را به آوا می‌سپارد."}</p>
                {!khosroMet && <button type="button" className="sf-primary-button" onClick={() => {
                  setKhosroMet(true);
                  collectItem("tuning-fork-440");
                  recordClue("khosro-fate");
                  setStatus("خسرو دیاپازون ۴۴۰ هرتز را سپرد و سرنخ سرنوشت سهراب در دفترچه ثبت شد.");
                }}>گفت‌وگو با خسرو و دریافت دیاپازون</button>}
              </div>
            )}
            {activeHotspot.action === "floor-hatch" && (
              <div className="sf-hatch-puzzle">
                {hatchOpened ? (
                  <div className="sf-audio-success"><Check size={16}/><div><strong>محفظه باز شده است</strong><p>نوار مستر و نامهٔ سهراب را از محفظه بردار؛ پس از آن برای رویارویی نهایی به محوطهٔ بیرونی برگرد.</p></div></div>
                ) : (
                  <>
                    <p>{!forkResonating ? "شیار باریکی روی دریچه دیده می‌شود. دیاپازون ۴۴۰ هرتز باید مرتعش باشد و ظرف ده ثانیه در شیار قرار گیرد." : "دیاپازون هنوز در حال ارتعاش است. دو مدرک عددی را از دفترچه مرور کن و رمز چهاررقمی را وارد کن."}</p>
                    {!hatchEvidenceReady && <div className="sf-phase4-note">برای کشف رمز، ابتدا عکس افتتاحیه و یادداشت فنی پشت رادیوی خانهٔ راد را هر دو بررسی کن.</div>}
                    <label className="sf-hatch-code"><span>رمز چهاررقمی</span><input aria-label="رمز دریچه" inputMode="numeric" maxLength={4} value={hatchCode} disabled={!forkResonating || !hatchEvidenceReady} onChange={(event) => setHatchCode(event.target.value.replace(/\D/g, "").slice(0,4))} placeholder="· · · ·"/></label>
                    <button type="button" className="sf-primary-button" disabled={!forkResonating || !hatchEvidenceReady || hatchCode.length !== 4} onClick={() => {
                      if (hatchCode !== "1359") { setStatus("قفل عددی باز نشد؛ عکس افتتاحیه و یادداشت فنی را دوباره تطبیق بده."); return; }
                      setHatchOpened(true);
                      setForkResonating(false);
                      recordClue("master-tape-recovered");
                      recordClue("sohrab-letter");
                      collectItem("master-tape-13");
                      collectItem("sohrab-letter");
                      setStatus("دریچه با هر دو شرط باز شد؛ نوار مستر و نامهٔ سهراب در محفظه‌اند.");
                    }}>باز کردن دریچه</button>
                  </>
                )}
              </div>
            )}
            {activeHotspot.action === "final-confrontation" && (
              <div className="sf-phase4-actions">
                <p>{gameEnded ? "مدرک به مرجع مستقل سپرده شده و نوار مستر محفوظ مانده است." : inventoryIds.includes("master-tape-13") ? "نوار مستر و نامهٔ سهراب آماده‌اند. آوا می‌تواند آن‌ها را به مرجع مستقل بسپارد و با دانشیار روبه‌رو شود." : "برای رویارویی نهایی، ابتدا نسخهٔ مستر نوار ۱۳ را از محفظهٔ زیر کف استودیو پیدا کن."}</p>
                {!gameEnded && <button type="button" className="sf-primary-button" disabled={!inventoryIds.includes("master-tape-13")} onClick={() => {
                  setGameEnded(true);
                  recordClue("master-tape-recovered");
                  setActiveHotspot(null);
                  setStatus("پایان روایت: مدارک برای بررسی مستقل تحویل شده‌اند.");
                }}>تحویل شواهد و پایان پرونده</button>}
              </div>
            )}
            {activeHotspot.id === "tape-deck" && <div className="sf-phase3-actions">
              <button type="button" className="sf-secondary-button" onClick={() => { recordClue("transformer-110v"); setStatus("یادداشت ولتاژ ترانس در دفترچه ثبت شد."); }}><BookOpen size={15}/> بررسی دفترچه تعمیرات</button>
              <button type="button" className="sf-primary-button" onClick={() => { setAudioDeskInitialTab(calibrationComplete ? "motor" : "calibration"); setActiveHotspot(null); setAudioDeskOpen(true); }}><AudioLines size={15}/> باز کردن میز صوتی</button>
            </div>}
            <div className="sf-inspection__bottom">
              <span className="sf-inspection__location"><Check size={15} /> آوا به نقطهٔ تعامل رسیده است</span>
              {activeCollectibleItemIds.filter((itemId) => !inventoryIds.includes(itemId)).map((itemId) => {
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

      {gameEnded && (
        <div className="sf-dialog-scrim">
          <section className="sf-inspection sf-ending" role="dialog" aria-modal="true" aria-labelledby="sf-ending-title">
            <div className="sf-inspection__kicker"><RadioTower size={15}/> پایان پروندهٔ نوار سیزدهم</div>
            <h2 id="sf-ending-title">حقیقت در برابر امواج گم نشد</h2>
            <p>آوا نسخهٔ مستر و نامهٔ پدرش را به مرجع مستقل سپرد. کنار هم قرار گرفتن شواهد فنی، ثبت‌های اداری و روایت شاهدان، بررسی دوبارهٔ پروندهٔ غرق‌شدن ققنوس و اتهام قدیمی علیه سهراب راد را ممکن کرد.</p>
            <p>اعادهٔ حیثیت، یک حکم آنی نیست؛ این بار پرونده با مدارک قابل بررسی گشوده شده است. نام سهراب از سکوت بیرون آمده و آوا توانسته روایت پدر را از شایعه جدا کند.</p>
            <div className="sf-ending__credits"><strong>فرکانس خاموش</strong><span>پروندهٔ نوار سیزدهم</span><small>پایان برش روایی · نسخهٔ صوتی و هنری نهایی در فازهای بعد تکمیل می‌شوند.</small></div>
          </section>
        </div>
      )}
      <div className="sf-sr-only" aria-live="polite">{status}</div>
    </main>
  );
}
