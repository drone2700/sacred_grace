// audio.js — efectos sintetizados con la Web Audio API (sin archivos)
let actx = null, master = null;

export function initAudio(){
  if(actx){ if(actx.state==='suspended') actx.resume(); return; }
  try{
    actx = new (window.AudioContext||window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0.5;
    master.connect(actx.destination);
  }catch(e){ actx = null; }
}

function tone(freq, dur, type, vol, slideTo){
  if(!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, t);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo), t+dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol||0.2, t+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t+dur+0.02);
}
function noiseBurst(dur, vol, filtType, filtFreq, slideTo){
  if(!actx) return;
  const t = actx.currentTime;
  const n = Math.floor(actx.sampleRate*dur);
  const buf = actx.createBuffer(1, n, actx.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i] = (Math.random()*2-1);
  const src = actx.createBufferSource(); src.buffer = buf;
  const f = actx.createBiquadFilter();
  f.type = filtType||'bandpass'; f.frequency.setValueAtTime(filtFreq||1200, t);
  if(slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(40,slideTo), t+dur);
  f.Q.value = 0.9;
  const g = actx.createGain();
  g.gain.setValueAtTime(vol||0.2, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t); src.stop(t+dur+0.02);
}

export const SFX = {
  jump(){ tone(240, 0.16, 'square', 0.18, 470); },
  spin(){ noiseBurst(0.30, 0.20, 'bandpass', 1300, 520); tone(190,0.30,'sawtooth',0.10,90); },
  hurt(){ tone(330, 0.30, 'sawtooth', 0.28, 70); noiseBurst(0.12,0.12,'lowpass',900); },
  bark(){ tone(120, 0.5, 'sawtooth', 0.24, 40); noiseBurst(0.5, 0.22, 'lowpass', 1400, 220); tone(70,0.55,'sine',0.18,38); },
  spit(){ noiseBurst(0.10, 0.16, 'bandpass', 900); },
  splat(){ noiseBurst(0.16, 0.22, 'lowpass', 600); tone(90,0.12,'square',0.1,50); },
  relic(){ const seq=[392,523,659,784,1046]; seq.forEach((f,i)=> setTimeout(()=>tone(f,0.18,'square',0.2),i*70)); },
  clear(){ const seq=[523,659,784,659,784,1046]; seq.forEach((f,i)=> setTimeout(()=>tone(f,0.22,'triangle',0.2),i*120)); },
  victory(){ const seq=[523,659,784,1046,784,1046,1318]; seq.forEach((f,i)=> setTimeout(()=>tone(f,0.32,'triangle',0.22),i*170)); },
  step(){ noiseBurst(0.04, 0.05, 'lowpass', 500); }
};
