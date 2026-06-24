// main.js — punto de entrada: bucle, camara, condicion de purga y UI
import { G, player } from './state.js';
import { VW } from './config.js';
import { clamp } from './utils.js';
import { initAudio } from './audio.js';
import { show, hideAll } from './ui.js';
import { buildLevel, advance, triggerClear } from './level.js';
import { movePlayer } from './player.js';
import { updateEnemies } from './enemies.js';
import { updateProjectiles } from './projectiles.js';
import { updateWaves } from './waves.js';
import { updateRelics } from './relics.js';
import { updateParticles } from './particles.js';
import { render } from './render.js';
import './input.js';   // adjunta los listeners de teclado

let last = performance.now();
function loop(now){
  let dt=(now-last)/1000; last=now;
  if(dt>0.05) dt=0.05;
  G.time+=dt;

  if(G.state==='play'){
    movePlayer(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updateWaves(dt);
    updateRelics(dt);
    updateParticles(dt);
    G.projectiles = G.projectiles.filter(p=>!p.dead);
    if(G.total>0 && G.killed>=G.total) triggerClear();
    G.cameraX = clamp(player.x + player.w/2 - VW/2, 0, G.LEVEL_W - VW);
  } else if(G.state==='clear'){
    updateParticles(dt); updateWaves(dt);
    G.clearTimer-=dt;
    if(G.clearTimer<=0) advance();
  } else {
    updateParticles(dt);
  }

  render(dt);
  requestAnimationFrame(loop);
}

// --- ajustes (dificultad / corazones) ---
function wirePicks(rowId, key, parse){
  document.querySelectorAll('#'+rowId+' .pick').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('#'+rowId+' .pick').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
      G.settings[key] = parse(b.dataset[key]);
    });
  });
}
wirePicks('diffRow', 'diff', parseFloat);
wirePicks('heartRow', 'hearts', v=>parseInt(v,10));

// --- botones de pantalla ---
document.getElementById('startBtn').addEventListener('click', ()=>{
  initAudio(); G.maxHearts = G.settings.hearts; hideAll(); buildLevel(0);
});
document.getElementById('reviveBtn').addEventListener('click', ()=>{
  initAudio(); hideAll(); buildLevel(G.levelIndex);
});
document.getElementById('againBtn').addEventListener('click', ()=>{
  initAudio(); show('intro'); G.state='intro'; G.levelIndex=0;
});

requestAnimationFrame(loop);
if(document.fonts && document.fonts.load) document.fonts.load("8px 'Press Start 2P'").catch(()=>{});
