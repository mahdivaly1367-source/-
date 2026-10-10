export interface MotorSignalMetrics { peakFrequencyHz:number; peakDb:number; rms:number }
export interface MotorFilterOptions { lowPassHz:number; notchHz:number; durationMs?:number; onMetrics?:(metrics:MotorSignalMetrics)=>void }
function measureSignal(context:AudioContext, analyser:AnalyserNode, f:Float32Array<ArrayBuffer>, t:Uint8Array<ArrayBuffer>):MotorSignalMetrics {
 analyser.getFloatFrequencyData(f); analyser.getByteTimeDomainData(t);
 const lo=Math.max(1,Math.floor(25*analyser.fftSize/context.sampleRate));
 const hi=Math.min(f.length-1,Math.ceil(160*analyser.fftSize/context.sampleRate));
 let peak=lo, db=-Infinity;
 for(let i=lo;i<=hi;i++){if(f[i]>db){db=f[i];peak=i;}}
 let sum=0; for(const n of t){const v=(n-128)/128;sum+=v*v;}
 return {peakFrequencyHz:peak*context.sampleRate/analyser.fftSize,peakDb:db,rms:Math.sqrt(sum/t.length)};
}
/** Synthesized calibration tone; the original archival recording is not bundled in this prototype. */
export async function playCalibrationTone(frequencyHz:number,durationMs=850):Promise<void>{
 const c=new AudioContext();
 try{await c.resume();const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(frequencyHz,c.currentTime);
 g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.07,c.currentTime+.04);
 g.gain.setValueAtTime(.07,c.currentTime+Math.max(.05,durationMs/1000-.08));g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+durationMs/1000);
 o.connect(g);g.connect(c.destination);const ended=new Promise<void>(resolve=>o.addEventListener("ended",()=>resolve(),{once:true}));
 o.start();o.stop(c.currentTime+durationMs/1000);await ended;
 }finally{await c.close();}
}
/** 40Hz motor + 50Hz mains hum + broadband noise, passed through real Web Audio filters. */
export async function analyzeMotorSignal({lowPassHz,notchHz,durationMs=2300,onMetrics}:MotorFilterOptions):Promise<MotorSignalMetrics>{
 const c=new AudioContext(),oscillators:OscillatorNode[]=[];let noise:AudioBufferSourceNode|null=null,timer=0;
 try{
  await c.resume();
  const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(Math.max(80,Math.min(4000,lowPassHz)),c.currentTime);lp.Q.value=.707;
  const notch=c.createBiquadFilter();notch.type="notch";notch.frequency.setValueAtTime(Math.max(30,Math.min(120,notchHz)),c.currentTime);notch.Q.value=24;
  const analyser=c.createAnalyser();analyser.fftSize=16384;analyser.smoothingTimeConstant=.22;
  const output=c.createGain();output.gain.value=.7;lp.connect(notch);notch.connect(analyser);analyser.connect(output);output.connect(c.destination);
  const motor=c.createOscillator(),mg=c.createGain();motor.type="sine";motor.frequency.value=40;mg.gain.value=.42;motor.connect(mg);mg.connect(lp);oscillators.push(motor);
  const hum=c.createOscillator(),hg=c.createGain();hum.type="sine";hum.frequency.value=50;hg.gain.value=.12;hum.connect(hg);hg.connect(lp);oscillators.push(hum);
  const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.08;
  noise=c.createBufferSource();noise.buffer=buf;noise.loop=true;const ng=c.createGain();ng.gain.value=.055;noise.connect(ng);ng.connect(lp);
  const f=new Float32Array(analyser.frequencyBinCount),t=new Uint8Array(analyser.fftSize);
  let latest:MotorSignalMetrics={peakFrequencyHz:0,peakDb:-120,rms:0};
  motor.start();hum.start();noise.start();const sample=()=>{latest=measureSignal(c,analyser,f,t);onMetrics?.(latest);};sample();
  timer=window.setInterval(sample,90);await new Promise<void>(resolve=>window.setTimeout(resolve,durationMs));
  window.clearInterval(timer);timer=0;sample();return latest;
 }finally{if(timer)window.clearInterval(timer);for(const o of oscillators){try{o.stop()}catch{}o.disconnect();}
  if(noise){try{noise.stop()}catch{}noise.disconnect();}await c.close();}
}
