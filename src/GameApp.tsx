import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
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
  const [status, setStatus] = useState("روی کف اتاق کلیک کن تا آوا حرکت کند؛ برای بررسی، ماوس را روی اشیا ببر.");
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

  const activateHotspot = useCallback((hotspot: SceneHotspot) => {
    setHoveredHotspotId(null);
    setActiveHotspot(null);
    moveTo(hotspot.walkTarget, () => {
      setFacing(hotspot.facing);
      setActiveHotspot(hotspot);
      setStatus("بررسی شد: " + hotspot.title);
    });
  }, [moveTo]);

  const handleViewportClick = (event: MouseEvent<HTMLElement>) => {
    if (activeHotspot || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
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
        setActiveHotspot(null);
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
          <span className="sf-phase-badge"><span /> نمونهٔ قابل‌بازی · فاز ۱</span>
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
              <div className="sf-inspection__note">
                <Info size={17} />
                <span>تعویض کامل صحنه‌ها در فاز بعد به موتور داده‌محور متصل می‌شود؛ اینجا مسیر برای آزمون تعامل و جهت‌گیری آماده است.</span>
              </div>
            )}
            <div className="sf-inspection__bottom">
              <span className="sf-inspection__location"><Check size={15} /> آوا به نقطهٔ تعامل رسیده است</span>
              <button type="button" className="sf-primary-button" onClick={() => setActiveHotspot(null)}>ادامهٔ کاوش</button>
            </div>
          </section>
        </div>
      )}

      <div className="sf-sr-only" aria-live="polite">{status}</div>
    </main>
  );
}
