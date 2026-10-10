type AmbientSceneId =
  | "scene_exterior"
  | "scene_studio"
  | "scene_archive"
  | "scene_pier"
  | "scene_lighthouse"
  | "scene_homestead";

type LayerName = "rain" | "surf" | "wind" | "electrical" | "hearth";
type AmbientProfile = Record<LayerName, number>;

const PROFILES: Record<AmbientSceneId, AmbientProfile> = {
  scene_exterior: { rain: 0.2, surf: 0.16, wind: 0.085, electrical: 0.001, hearth: 0 },
  scene_studio: { rain: 0.045, surf: 0.035, wind: 0.012, electrical: 0.028, hearth: 0 },
  scene_archive: { rain: 0.018, surf: 0.015, wind: 0.004, electrical: 0.035, hearth: 0 },
  scene_pier: { rain: 0.15, surf: 0.2, wind: 0.11, electrical: 0.001, hearth: 0 },
  scene_lighthouse: { rain: 0.12, surf: 0.18, wind: 0.15, electrical: 0.012, hearth: 0 },
  scene_homestead: { rain: 0.035, surf: 0.025, wind: 0.02, electrical: 0.006, hearth: 0.012 },
};

/**
 * Creates a lightweight, synthesized sound bed from filtered noise and quiet tones.
 * No recording or external audio file is needed; playback starts only after user input.
 */
export class AmbientSoundscape {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private readonly layers: Record<LayerName, GainNode | null> = {
    rain: null,
    surf: null,
    wind: null,
    electrical: null,
    hearth: null,
  };
  private readonly sources: AudioScheduledSourceNode[] = [];
  private operationToken = 0;

  async start(sceneId: AmbientSceneId): Promise<void> {
    if (!this.context) this.createGraph();
    const context = this.context;
    const master = this.master;
    if (!context || !master) throw new Error("Ambient audio graph is unavailable");

    this.operationToken += 1;
    await context.resume();
    this.setScene(sceneId);
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0.34, now, 0.12);
  }

  setScene(sceneId: AmbientSceneId): void {
    const context = this.context;
    if (!context || context.state === "closed") return;

    const profile = PROFILES[sceneId];
    const now = context.currentTime;
    (Object.keys(profile) as LayerName[]).forEach((name) => {
      const gain = this.layers[name];
      if (!gain) return;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(profile[name], now, 0.45);
    });
  }

  async stop(): Promise<void> {
    const context = this.context;
    const master = this.master;
    if (!context || !master || context.state === "closed") return;

    const token = ++this.operationToken;
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0, now, 0.045);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
    if (token === this.operationToken && context.state === "running") {
      await context.suspend();
    }
  }

  async dispose(): Promise<void> {
    this.operationToken += 1;
    const context = this.context;
    this.context = null;
    this.master = null;
    if (!context || context.state === "closed") return;

    this.sources.forEach((source) => {
      try { source.stop(); } catch { /* Already stopped. */ }
    });
    this.sources.length = 0;
    try { await context.close(); } catch { /* The page may already be closing. */ }
    (Object.keys(this.layers) as LayerName[]).forEach((name) => {
      this.layers[name] = null;
    });
  }

  private createGraph(): void {
    if (typeof window === "undefined" || typeof window.AudioContext !== "function") {
      throw new Error("Web Audio API is not supported");
    }

    const context = new window.AudioContext();
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.context = context;
    this.master = master;

    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let seed = 0x6d2b79f5;
    for (let index = 0; index < channel.length; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      channel[index] = ((seed / 4294967296) * 2 - 1) * 0.62;
    }

    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    this.connectLayer(noise, "surf", "lowpass", 230, 0.35);
    this.connectLayer(noise, "rain", "bandpass", 2350, 0.55);
    this.connectLayer(noise, "wind", "bandpass", 430, 0.7);
    noise.start();
    this.sources.push(noise);

    const electrical = context.createOscillator();
    electrical.type = "sine";
    electrical.frequency.value = 50;
    const electricalGain = context.createGain();
    electricalGain.gain.value = 0;
    electrical.connect(electricalGain);
    electricalGain.connect(master);
    electrical.start();
    this.layers.electrical = electricalGain;
    this.sources.push(electrical);

    const hearth = context.createOscillator();
    hearth.type = "triangle";
    hearth.frequency.value = 126;
    const hearthGain = context.createGain();
    hearthGain.gain.value = 0;
    hearth.connect(hearthGain);
    hearthGain.connect(master);
    hearth.start();
    this.layers.hearth = hearthGain;
    this.sources.push(hearth);
  }

  private connectLayer(
    source: AudioNode,
    name: "rain" | "surf" | "wind",
    type: BiquadFilterType,
    frequency: number,
    q: number,
  ): void {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = context.createGain();
    gain.gain.value = 0;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    this.layers[name] = gain;
  }
}
